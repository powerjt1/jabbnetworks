# jabb-sentinel — Main product (SvelteKit)

The JABB Sentinel app: a landing page (`/`) and the operational **Mission Control**
cockpit (`/dashboard`, which embeds the self-contained dashboard from `static/`).

## Run
```bash
npm install
cp .env.example .env      # AI_PROVIDER=ollama by default (free/local)
npm run dev               # http://localhost:5173
```

## Structure
- `src/routes/+page.svelte` — landing ("Activate Sentinel").
- `src/routes/dashboard/+page.svelte` — embeds `static/mission-control.html`.
- `src/routes/api/execute/+server.js` — `POST /api/execute { task }` runs the orchestrator.
- `src/lib/orchestrator/SentinelOrchestrator.js` — plan → execute → validate → report.
- `src/lib/ai/factory.js` — provider factory (`AI_PROVIDER`).
- `src/lib/ai/providers/*` — openai · claude · azure-openai · ollama · opencode.
- `src/lib/ai/prompts.js` — `SENTINEL_SYSTEM_PROMPT`.
- `static/mission-control.html` — the full self-contained dashboard.

LLM keys are read server-side from the environment; nothing is shipped to the client.
