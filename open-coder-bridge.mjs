#!/usr/bin/env node
/**
 * JABB Networks Bridge Server  (formerly Open Coder Bridge)
 *
 * Runs on your PC, serves the app + Mission Control to any device on your
 * Wi-Fi, proxies local model requests (Ollama / LM Studio), and can create
 * real Google Calendar events from RTR submissions.
 *
 * Usage:
 *   node open-coder-bridge.mjs                       # default port 8899
 *   PORT=3000 node open-coder-bridge.mjs             # custom port
 *   OLLAMA_URL=http://192.168.1.50:11434 node open-coder-bridge.mjs
 *
 * Google Calendar (optional — enables auto-create of RTR events):
 *   1. Create an OAuth 2.0 "Desktop app" client at
 *      https://console.cloud.google.com/apis/credentials  (enable Google
 *      Calendar API for the project first).
 *   2. Add  http://localhost:8899/oauth2/callback  as an authorized
 *      redirect URI (match your PORT).
 *   3. Run:
 *      GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node open-coder-bridge.mjs
 *   4. Visit  http://localhost:8899/calendar/auth  once to authorize.
 *
 * Endpoints:
 *   GET  /                    → Mission Control (injected with bridge config)
 *   GET  /mission-control     → Mission Control dashboard
 *   GET  /coder               → Open Coder Lite
 *   GET  /connect             → QR code + instructions for phone setup
 *   GET  /health              → Server status, IP, models, calendar state
 *   POST /proxy/ollama/*      → Proxies to Ollama on your PC
 *   POST /proxy/lmstudio/*    → Proxies to LM Studio on your PC
 *   GET  /calendar/status     → { configured, authorized }
 *   GET  /calendar/auth       → Start Google OAuth consent
 *   GET  /oauth2/callback     → OAuth redirect target (stores token)
 *   POST /calendar/create     → Create a Google Calendar event
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

// ── Config ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8899', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(__dirname, '.bridge-google-token.json');
const CAL_CONFIGURED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

// ── Helpers ─────────────────────────────────────────────────────────
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
const REDIRECT_URI = `http://localhost:${PORT}/oauth2/callback`;

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access');
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// ── Google Calendar (token store + OAuth) ───────────────────────────
function loadToken() {
  try { return JSON.parse(readFileSync(TOKEN_FILE, 'utf8')); } catch { return null; }
}
function saveToken(tok) {
  try { writeFileSync(TOKEN_FILE, JSON.stringify(tok, null, 2)); } catch (e) { console.error('token save failed', e.message); }
}
function calAuthorized() { return !!loadToken()?.refresh_token; }

function googleAuthUrl() {
  const p = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  });
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + p.toString();
}

async function exchangeCode(code) {
  const body = new URLSearchParams({
    code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || d.error || 'token exchange failed');
  const existing = loadToken() || {};
  const tok = { ...existing, ...d, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
  if (!tok.refresh_token && existing.refresh_token) tok.refresh_token = existing.refresh_token;
  saveToken(tok);
  return tok;
}

async function getAccessToken() {
  let tok = loadToken();
  if (!tok) throw new Error('not authorized — visit /calendar/auth');
  if (tok.access_token && tok.expires_at && Date.now() < tok.expires_at - 60000) return tok.access_token;
  // refresh
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: tok.refresh_token, grant_type: 'refresh_token',
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || d.error || 'token refresh failed');
  tok = { ...tok, ...d, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
  saveToken(tok);
  return tok.access_token;
}

async function createCalendarEvent({ title, description, start, end, timezone }) {
  const token = await getAccessToken();
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const event = {
    summary: title,
    description: description || '',
    start: { dateTime: start, timeZone: tz },
    end: { dateTime: end, timeZone: tz },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }] },
  };
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(event),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'event create failed');
  return { id: d.id, htmlLink: d.htmlLink };
}

// ── Proxy to local services ─────────────────────────────────────────
async function proxyFetch(targetUrl, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/proxy\/(ollama|lmstudio)/, '');
  const target = targetUrl.replace(/\/$/, '') + path + url.search;

  const body = await readBody(req);
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!['host', 'connection', 'transfer-encoding'].includes(k)) headers[k] = v;
  }

  return fetch(target, {
    method: req.method,
    headers,
    body: body.length > 0 ? body : undefined,
  });
}

// ── Serve an HTML app file (inject bridge config) ───────────────────
function bridgeConfigScript() {
  return `
    <script>
      window.__BRIDGE__ = {
        available: true,
        url: 'http://${LOCAL_IP}:${PORT}',
        ollama: 'http://${LOCAL_IP}:${PORT}/proxy/ollama',
        lmstudio: 'http://${LOCAL_IP}:${PORT}/proxy/lmstudio',
        localIP: '${LOCAL_IP}',
        port: ${PORT},
        calendar: { configured: ${CAL_CONFIGURED}, authorized: ${calAuthorized()} }
      };
    </script>`;
}

function serveAppFile(res, candidates) {
  let html = null;
  for (const c of candidates) {
    const p = join(__dirname, ...c);
    if (existsSync(p)) { html = readFileSync(p, 'utf8'); break; }
  }
  if (html == null) { json(res, 404, { error: candidates[0].join('/') + ' not found' }); return; }
  html = html.replace('</head>', bridgeConfigScript() + '\n</head>');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ── Connect page (QR + instructions) ───────────────────────────────
function serveConnect(res) {
  const url = `http://${LOCAL_IP}:${PORT}`;
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>JABB Networks — Connect</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #060a10; color: #def0ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #0c131c; border: 1px solid #223e52; border-radius: 16px; padding: 32px; max-width: 440px; width: 100%; text-align: center; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    .sub { color: #809cb2; font-size: 13px; margin-bottom: 24px; }
    img { border-radius: 12px; margin-bottom: 20px; background: white; padding: 8px; }
    .url { background: #121c28; border: 1px solid #223e52; border-radius: 10px; padding: 12px 16px; font-family: monospace; font-size: 14px; color: #22d3ee; word-break: break-all; margin-bottom: 20px; cursor: pointer; }
    .url:hover { border-color: #22d3ee; }
    .steps { text-align: left; font-size: 13px; color: #809cb2; line-height: 1.7; }
    .steps b { color: #def0ff; }
    .steps code { background: #121c28; padding: 1px 5px; border-radius: 4px; color: #f5c542; font-size: 12px; }
    .badge { display: inline-block; background: rgba(34,211,238,.15); color: #22d3ee; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">LAN Bridge</div>
    <h1>Connect Your Phone</h1>
    <p class="sub">Scan this QR code or open the URL on any device</p>
    <img src="${qrApi}" alt="QR Code" width="220" height="220"/>
    <div class="url" onclick="navigator.clipboard.writeText(this.textContent).then(()=>this.textContent='Copied!')">${url}</div>
    <div class="steps">
      <b>1.</b> Make sure your phone is on the <b>same Wi-Fi</b> as this PC<br/>
      <b>2.</b> Open the URL above in your phone's browser<br/>
      <b>3.</b> Select a local model — it routes through this PC automatically<br/>
      <br/>
      <b>Mission Control:</b> <code>${url}/mission-control</code><br/>
      <b>What's happening:</b> This PC runs a bridge server that proxies
      requests to Ollama/LM Studio. Your phone uses your PC's GPU/CPU
      with zero CORS configuration. Cloud models (OpenAI, Anthropic)
      work directly from the phone.
    </div>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function htmlPage(res, status, title, bodyHtml) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;background:#060a10;color:#def0ff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center}
    .b{max-width:460px;background:#0c131c;border:1px solid #223e52;border-radius:16px;padding:32px}h1{font-size:20px;margin:0 0 10px}p{color:#809cb2;line-height:1.6}a{color:#22d3ee}code{background:#121c28;padding:2px 6px;border-radius:5px;color:#f5c542}</style>
    </head><body><div class="b">${bodyHtml}</div></body></html>`);
}

// ── Main server ─────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  corsHeaders(res);

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === '/health') {
    let ollamaOk = false, lmstudioOk = false, ollamaModels = [];
    try {
      const r = await fetch(OLLAMA_URL + '/api/tags', { signal: AbortSignal.timeout(3000) });
      const d = await r.json();
      ollamaOk = true;
      ollamaModels = (d.models || []).map(m => m.name);
    } catch {}
    try {
      const r = await fetch(LMSTUDIO_URL + '/v1/models', { signal: AbortSignal.timeout(3000) });
      if (r.ok) lmstudioOk = true;
    } catch {}

    return json(res, 200, {
      status: 'ok',
      ip: LOCAL_IP,
      port: PORT,
      url: `http://${LOCAL_IP}:${PORT}`,
      services: {
        ollama: { url: OLLAMA_URL, available: ollamaOk, models: ollamaModels },
        lmstudio: { url: LMSTUDIO_URL, available: lmstudioOk },
        calendar: { configured: CAL_CONFIGURED, authorized: calAuthorized() },
        serpapi: { configured: !!SERPAPI_KEY },
      },
    });
  }

  // ── Google Calendar ──
  if (url.pathname === '/calendar/status') {
    return json(res, 200, { configured: CAL_CONFIGURED, authorized: calAuthorized(), redirectUri: REDIRECT_URI });
  }

  if (url.pathname === '/calendar/auth') {
    if (!CAL_CONFIGURED) {
      return htmlPage(res, 400, 'Calendar not configured',
        `<h1>Google Calendar not configured</h1><p>Restart the bridge with your OAuth credentials:</p>
         <p><code>GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… node open-coder-bridge.mjs</code></p>
         <p>Then add <code>${REDIRECT_URI}</code> as an authorized redirect URI in Google Cloud Console.</p>`);
    }
    res.writeHead(302, { Location: googleAuthUrl() });
    res.end();
    return;
  }

  if (url.pathname === '/oauth2/callback') {
    const code = url.searchParams.get('code');
    const err = url.searchParams.get('error');
    if (err) return htmlPage(res, 400, 'Authorization failed', `<h1>Authorization failed</h1><p>${err}</p>`);
    if (!code) return htmlPage(res, 400, 'Missing code', `<h1>Missing authorization code</h1>`);
    try {
      await exchangeCode(code);
      return htmlPage(res, 200, 'Connected', `<h1>✅ Google Calendar connected</h1>
        <p>RTR submissions in Mission Control will now create real calendar events automatically.</p>
        <p><a href="/mission-control">Open Mission Control →</a></p>`);
    } catch (e) {
      return htmlPage(res, 500, 'Error', `<h1>Token exchange failed</h1><p>${e.message}</p>`);
    }
  }

  if (url.pathname === '/calendar/create' && req.method === 'POST') {
    if (!CAL_CONFIGURED) return json(res, 400, { error: 'not_configured', hint: 'Start bridge with GOOGLE_CLIENT_ID/SECRET' });
    if (!calAuthorized()) return json(res, 401, { error: 'not_authorized', authUrl: `http://${LOCAL_IP}:${PORT}/calendar/auth` });
    try {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      if (!body.title || !body.start || !body.end) return json(res, 400, { error: 'missing title/start/end' });
      const result = await createCalendarEvent(body);
      return json(res, 200, { ok: true, ...result });
    } catch (e) {
      const status = /not authorized/.test(e.message) ? 401 : 500;
      return json(res, status, { error: e.message, authUrl: status === 401 ? `http://${LOCAL_IP}:${PORT}/calendar/auth` : undefined });
    }
  }

  // SerpAPI → Google Jobs (proxied to avoid browser CORS)
  if (url.pathname === '/jobs/serpapi') {
    const key = url.searchParams.get('key') || SERPAPI_KEY;
    if (!key) return json(res, 400, { error: 'no SerpAPI key (set SERPAPI_KEY env or pass ?key=)' });
    const q = url.searchParams.get('q') || 'Power Platform Developer';
    const location = url.searchParams.get('location') || 'Remote';
    try {
      const api = 'https://serpapi.com/search.json?engine=google_jobs&q=' +
        encodeURIComponent(q + ' remote') + '&location=' + encodeURIComponent(location) +
        '&api_key=' + encodeURIComponent(key);
      const r = await fetch(api, { signal: AbortSignal.timeout(15000) });
      const d = await r.json();
      if (d.error) return json(res, 502, { error: d.error });
      const jobs = (d.jobs_results || []).map((j) => ({
        title: j.title,
        company: j.company_name || '—',
        salary: (j.detected_extensions && j.detected_extensions.salary) || '',
        type: (j.detected_extensions && j.detected_extensions.schedule_type) || 'Full-time',
        source: 'SerpAPI',
        url: (j.apply_options && j.apply_options[0] && j.apply_options[0].link) || j.share_link || '#',
        note: (j.location || '') + (j.description ? ' · ' + j.description.slice(0, 90) : ''),
      }));
      return json(res, 200, { ok: true, count: jobs.length, jobs });
    } catch (e) {
      return json(res, 502, { error: 'SerpAPI fetch failed', detail: e.message });
    }
  }

  // Connect page
  if (url.pathname === '/connect') return serveConnect(res);

  // Proxy: Ollama
  if (url.pathname.startsWith('/proxy/ollama/')) {
    try {
      const resp = await proxyFetch(OLLAMA_URL, req);
      res.writeHead(resp.status, {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      const reader = resp.body.getReader();
      while (true) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
      res.end();
    } catch (e) {
      json(res, 502, { error: 'Ollama unreachable', detail: e.message });
    }
    return;
  }

  // Proxy: LM Studio
  if (url.pathname.startsWith('/proxy/lmstudio/')) {
    try {
      const resp = await proxyFetch(LMSTUDIO_URL, req);
      res.writeHead(resp.status, {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      const reader = resp.body.getReader();
      while (true) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
      res.end();
    } catch (e) {
      json(res, 502, { error: 'LM Studio unreachable', detail: e.message });
    }
    return;
  }

  // Mission Control dashboard
  if (url.pathname === '/mission-control' || url.pathname === '/mission-control.html') {
    return serveAppFile(res, [['public', 'mission-control.html'], ['mission-control.html']]);
  }

  // Open Coder Lite
  if (url.pathname === '/coder' || url.pathname === '/opencoder-lite.html') {
    return serveAppFile(res, [['public', 'opencoder-lite.html'], ['opencoder-lite.html']]);
  }

  // Root → Mission Control (falls back to coder if MC missing)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return serveAppFile(res, [['public', 'mission-control.html'], ['mission-control.html'], ['public', 'opencoder-lite.html'], ['opencoder-lite.html']]);
  }

  // Fallback
  json(res, 404, { error: 'Not found', hint: 'Try / , /mission-control , /coder , /connect , /health' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ⬡  JABB Networks Bridge');
  console.log(`  ├─ Mission Control: http://${LOCAL_IP}:${PORT}/mission-control`);
  console.log(`  ├─ Open Coder:      http://${LOCAL_IP}:${PORT}/coder`);
  console.log(`  ├─ Connect (QR):    http://${LOCAL_IP}:${PORT}/connect`);
  console.log(`  ├─ Health:          http://${LOCAL_IP}:${PORT}/health`);
  console.log(`  ├─ Ollama:          ${OLLAMA_URL} (proxied)`);
  console.log(`  └─ LM Studio:       ${LMSTUDIO_URL} (proxied)`);
  console.log('');
  if (CAL_CONFIGURED) {
    console.log(`  📅 Google Calendar: ${calAuthorized() ? 'authorized ✅' : 'configured — authorize at /calendar/auth'}`);
    console.log(`     Redirect URI to register: ${REDIRECT_URI}`);
  } else {
    console.log('  📅 Google Calendar: not configured (RTR falls back to .ics + Google link).');
    console.log('     Enable: GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… node open-coder-bridge.mjs');
  }
  console.log(`  🔎 SerpAPI (Google Jobs): ${SERPAPI_KEY ? 'configured ✅' : 'not set (add SERPAPI_KEY or pass key from the app)'}`);
  console.log('');
  console.log(`  Open on your phone (same Wi-Fi): http://${LOCAL_IP}:${PORT}`);
  console.log('');
});
