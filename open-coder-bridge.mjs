#!/usr/bin/env node
/**
 * Open Coder Bridge Server
 * 
 * Runs on your PC, serves the app to any device on your Wi-Fi,
 * and proxies local model requests (Ollama / LM Studio) so phones
 * can use your PC's models with no CORS setup.
 *
 * Usage:
 *   node open-coder-bridge.mjs                    # default port 8899
 *   PORT=3000 node open-coder-bridge.mjs          # custom port
 *   OLLAMA_URL=http://192.168.1.50:11434 node open-coder-bridge.mjs
 *
 * Endpoints:
 *   GET  /                   → The app (injected with bridge URL)
 *   GET  /connect            → QR code + instructions for phone setup
 *   GET  /health             → Server status, IP, models info
 *   POST /proxy/ollama/*     → Proxies to Ollama on your PC
 *   POST /proxy/lmstudio/*   → Proxies to LM Studio on your PC
 *   GET  /proxy/ollama/tags  → List available Ollama models
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

// ── Config ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8899', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234';
const __dirname = dirname(fileURLToPath(import.meta.url));

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

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access');
}

// ── Proxy to local services ─────────────────────────────────────────
async function proxyFetch(targetUrl, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/proxy\/(ollama|lmstudio)/, '');
  const target = targetUrl.replace(/\/$/, '') + path + url.search;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!['host', 'connection', 'transfer-encoding'].includes(k)) {
      headers[k] = v;
    }
  }

  const resp = await fetch(target, {
    method: req.method,
    headers,
    body: body.length > 0 ? body : undefined,
  });

  return resp;
}

// ── Serve the app (inject bridge config) ────────────────────────────
function serveApp(res) {
  let html;
  try {
    html = readFileSync(join(__dirname, 'public', 'opencoder-lite.html'), 'utf8');
  } catch {
    try {
      html = readFileSync(join(__dirname, 'opencoder-lite.html'), 'utf8');
    } catch {
      json(res, 404, { error: 'opencoder-lite.html not found' });
      return;
    }
  }

  // Inject bridge config before </head>
  const bridgeConfig = `
    <script>
      window.__BRIDGE__ = {
        available: true,
        url: 'http://${LOCAL_IP}:${PORT}',
        ollama: 'http://${LOCAL_IP}:${PORT}/proxy/ollama',
        lmstudio: 'http://${LOCAL_IP}:${PORT}/proxy/lmstudio',
        localIP: '${LOCAL_IP}',
        port: ${PORT}
      };
    </script>`;

  html = html.replace('</head>', bridgeConfig + '\n</head>');

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
  <title>Open Coder — Connect</title>
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

// ── Main server ─────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  corsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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
      },
    });
  }

  // Connect page
  if (url.pathname === '/connect') {
    return serveConnect(res);
  }

  // Proxy: Ollama
  if (url.pathname.startsWith('/proxy/ollama/')) {
    try {
      const resp = await proxyFetch(OLLAMA_URL, req);
      res.writeHead(resp.status, {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      const reader = resp.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          res.write(value);
        }
      };
      await pump();
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
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          res.write(value);
        }
      };
      await pump();
    } catch (e) {
      json(res, 502, { error: 'LM Studio unreachable', detail: e.message });
    }
    return;
  }

  // Serve the app
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return serveApp(res);
  }

  // Fallback
  json(res, 404, { error: 'Not found', hint: 'Try / or /connect or /health' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ⬡  Open Coder Bridge');
  console.log(`  ├─ App:     http://${LOCAL_IP}:${PORT}`);
  console.log(`  ├─ Connect: http://${LOCAL_IP}:${PORT}/connect`);
  console.log(`  ├─ Health:  http://${LOCAL_IP}:${PORT}/health`);
  console.log(`  ├─ Ollama:  ${OLLAMA_URL} (proxied)`);
  console.log(`  └─ LM Studio: ${LMSTUDIO_URL} (proxied)`);
  console.log('');
  console.log('  Open this on your phone (same Wi-Fi):');
  console.log(`  → http://${LOCAL_IP}:${PORT}`);
  console.log('');
});
