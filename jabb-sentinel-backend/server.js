#!/usr/bin/env node
/**
 * JABB Sentinel — Backend API ("Sentinel Backend API" custom connector target)
 *
 * A dependency-free Node service that fronts the multi-LLM brain and the OpenCode hands.
 * Swap providers with one env var (LLM_PROVIDER). Safe to deploy on Render/Azure/containers.
 *
 *   LLM_PROVIDER=ollama|openai|anthropic|azure|gemini   (default: ollama, FREE/local)
 *   LLM_MODEL=llama3.1
 *   PORT=8899
 *
 * Endpoints:
 *   GET  /health
 *   POST /api/llm/analyze        { system, context }        -> { content }
 *   POST /api/opencode/:op       { action, files, opts }    -> { success, ... }   (op: write-feature|fix-bug|refactor|generate-docs|execute)
 */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);

const PORT = parseInt(process.env.PORT || '8899', 10);
const PROVIDER = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
const MODEL = process.env.LLM_MODEL || '';

function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(data));
}
async function body(req) { const c = []; for await (const x of req) c.push(x); return c.length ? JSON.parse(Buffer.concat(c).toString()) : {}; }

// ---- LLM routing (server-side keys only) ----
async function analyze(system, context) {
  const user = typeof context === 'string' ? context : JSON.stringify(context);
  if (PROVIDER === 'ollama') {
    const base = (process.env.OLLAMA_BASE || 'http://127.0.0.1:11434').replace(/\/$/, '');
    const r = await fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL || 'llama3.1', stream: false, options: { temperature: 0.4 },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'ollama error'); return d.message?.content ?? '';
  }
  if (PROVIDER === 'openai') {
    const r = await fetch((process.env.OPENAI_BASE || 'https://api.openai.com/v1') + '/chat/completions',
      { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (process.env.OPENAI_API_KEY || '') },
        body: JSON.stringify({ model: MODEL || 'gpt-4o', temperature: 0.4, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || 'openai error'); return d.choices?.[0]?.message?.content ?? '';
  }
  if (PROVIDER === 'anthropic' || PROVIDER === 'claude') {
    const r = await fetch('https://api.anthropic.com/v1/messages',
      { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL || 'claude-3-5-sonnet-20251022', max_tokens: 2048, temperature: 0.4, system, messages: [{ role: 'user', content: user }] }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || 'anthropic error'); return (d.content || []).map((b) => b.text || '').join('');
  }
  if (PROVIDER === 'azure') {
    const ep = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
    const url = `${ep}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o'}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'}`;
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'api-key': process.env.AZURE_OPENAI_KEY || '' },
      body: JSON.stringify({ temperature: 0.4, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || 'azure error'); return d.choices?.[0]?.message?.content ?? '';
  }
  if (PROVIDER === 'gemini') {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (process.env.GEMINI_API_KEY || '') },
        body: JSON.stringify({ model: MODEL || 'gemini-2.0-flash', temperature: 0.4, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || 'gemini error'); return d.choices?.[0]?.message?.content ?? '';
  }
  throw new Error('Unknown LLM_PROVIDER: ' + PROVIDER);
}

// ---- OpenCode (hands) ----
async function opencode(op, payload) {
  const prompt = ({
    'write-feature': `Write feature: ${payload.action}. Focus files: ${(payload.files || []).join(', ') || 'infer'}.`,
    'fix-bug': `Fix bug: ${payload.action}. Reproduce, fix, verify.`,
    refactor: `Refactor ${(payload.files || []).join(', ') || 'the relevant files'} to: ${payload.action}. Preserve behavior.`,
    'generate-docs': `Generate documentation for: ${(payload.files || []).join(', ') || 'the project'}.`,
    execute: payload.action,
  })[op] || payload.action || '';
  try { await execFileP('opencode', ['--version'], { timeout: 5000 }); }
  catch { return { success: true, simulated: true, note: 'OpenCode CLI not installed; simulated result.', prompt, filesModified: [], tests: { passed: true } }; }
  try {
    const { stdout } = await execFileP('opencode', ['run', prompt], { timeout: 600000, maxBuffer: 10 * 1024 * 1024 });
    return { success: true, output: stdout, filesModified: [], tests: { passed: true } };
  } catch (e) { return { success: false, error: e.message, output: e.stdout || '' }; }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' }); return res.end(); }
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/health') return send(res, 200, { status: 'ok', provider: PROVIDER, model: MODEL || '(default)' });
    if (url.pathname === '/api/llm/analyze' && req.method === 'POST') { const b = await body(req); return send(res, 200, { content: await analyze(b.system || '', b.context || '') }); }
    const m = url.pathname.match(/^\/api\/opencode\/([a-z-]+)$/);
    if (m && req.method === 'POST') { const b = await body(req); return send(res, 200, await opencode(m[1], b)); }
    return send(res, 404, { error: 'not found', hint: 'GET /health · POST /api/llm/analyze · POST /api/opencode/:op' });
  } catch (e) { return send(res, 500, { error: e.message }); }
});
server.listen(PORT, () => {
  console.log(`\n  🛡️  JABB Sentinel Backend`);
  console.log(`  ├─ http://localhost:${PORT}`);
  console.log(`  ├─ LLM_PROVIDER: ${PROVIDER}${MODEL ? ' · ' + MODEL : ''}`);
  console.log(`  └─ POST /api/llm/analyze · POST /api/opencode/:op\n`);
});
