// Azure OpenAI — enterprise (HIPAA/FedRAMP-eligible).
export default class AzureOpenAIProvider {
  constructor() {
    this.endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
    this.key = process.env.AZURE_OPENAI_KEY || '';
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';
  }
  async analyze(context, systemPrompt) {
    if (!this.endpoint || !this.key) return { success: false, error: 'AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_KEY not set' };
    try {
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
      const r = await fetch(url, {
        method: 'POST', headers: { 'content-type': 'application/json', 'api-key': this.key },
        body: JSON.stringify({ temperature: 0.4, messages: [
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
