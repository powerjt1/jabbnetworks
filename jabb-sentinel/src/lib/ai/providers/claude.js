// Anthropic (Claude) — cloud.
export default class ClaudeProvider {
  constructor() {
    this.base = (process.env.ANTHROPIC_BASE || 'https://api.anthropic.com').replace(/\/$/, '');
    this.key = process.env.ANTHROPIC_API_KEY || '';
    this.model = process.env.LLM_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20251022';
  }
  async analyze(context, systemPrompt) {
    if (!this.key) return { success: false, error: 'ANTHROPIC_API_KEY not set' };
    try {
      const r = await fetch(this.base + '/v1/messages', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': this.key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: this.model, max_tokens: 2048, temperature: 0.4, system: systemPrompt,
          messages: [{ role: 'user', content: typeof context === 'string' ? context : JSON.stringify(context) }] }),
      });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error?.message || ('HTTP ' + r.status) };
      return { success: true, content: (d.content || []).map((b) => b.text || '').join('') };
    } catch (e) { return { success: false, error: e.message }; }
  }
}
