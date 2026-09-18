// OpenAI (ChatGPT) — cloud.
export default class OpenAIProvider {
  constructor() {
    this.base = (process.env.OPENAI_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    this.key = process.env.OPENAI_API_KEY || '';
    this.model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o';
  }
  async analyze(context, systemPrompt) {
    if (!this.key) return { success: false, error: 'OPENAI_API_KEY not set' };
    try {
      const r = await fetch(this.base + '/chat/completions', {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + this.key },
        body: JSON.stringify({ model: this.model, temperature: 0.4, messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: typeof context === 'string' ? context : JSON.stringify(context) },
        ] }),
      });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error?.message || ('HTTP ' + r.status) };
      return { success: true, content: d.choices?.[0]?.message?.content ?? '' };
    } catch (e) { return { success: false, error: e.message }; }
  }
}
