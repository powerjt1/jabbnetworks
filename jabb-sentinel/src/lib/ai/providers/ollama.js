// Ollama (local, FREE) — 100% private, zero data exfiltration.
export default class OllamaProvider {
  constructor() {
    this.base = (process.env.OLLAMA_BASE || 'http://localhost:11434').replace(/\/$/, '');
    this.model = process.env.LLM_MODEL || process.env.OLLAMA_MODEL || 'llama3.1';
  }
  async analyze(context, systemPrompt) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: typeof context === 'string' ? context : JSON.stringify(context) },
      ];
      const r = await fetch(this.base + '/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: this.model, messages, stream: false, options: { temperature: 0.4 } }),
      });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error || ('HTTP ' + r.status) };
      return { success: true, content: d.message?.content ?? '' };
    } catch (e) { return { success: false, error: e.message }; }
  }
}
