# JABB Sentinel — Go-Live Playbook (v1)

## 0. Pre-flight
- [ ] Pick edition (Local / Business / Enterprise) and LLM provider.
- [ ] `AGENTS.md` reviewed; two-output contract understood (branch under Mother + HTML preview).
- [ ] Secrets in env/Key Vault only — never in the repo.

## 1. Local smoke test
- [ ] `OLLAMA_ORIGINS=* ollama serve`, `ollama pull llama3.1`.
- [ ] Open `public/mission-control.html`; confirm crew loads, voice works, 0 console errors.
- [ ] `jabb-sentinel-backend`: `GET /health` returns `{status:"ok"}`; `POST /api/llm/analyze` returns content.

## 2. App
- [ ] `cd jabb-sentinel && npm install && npm run build` succeeds.
- [ ] `/` → "Activate Sentinel" → `/dashboard` embeds Mission Control.
- [ ] `POST /api/execute { "task": "..." }` returns a mission log (SUCCESS/PARTIAL).

## 3. Enterprise (if applicable)
- [ ] Landing zone via IaC; Managed Environments (Dev/Test/Prod); DLP baseline; Managed Identities.
- [ ] Dataverse solution imported (sentinel_* tables); Sentinel Backend API connector certified.
- [ ] Conditional Access + PIM configured; Purview labels + DLP verified; Sentinel monitoring on.
- [ ] One governed workflow piloted end-to-end with full audit.

## 4. Deploy & verify
- [ ] Backend deployed (Render/Azure Container Apps) with private networking where required.
- [ ] App deployed (adapter target); env vars set; health checks green.
- [ ] Rollback plan documented; RPO/RTO recorded.

## 5. Sign-off
- [ ] Security/GRC review passed (see docs/enterprise.md control mapping).
- [ ] Operator (Julio Thorpe) acceptance. Version tagged `v1.0.0`.
