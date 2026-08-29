# jabb-sentinel-backend — Sentinel Backend API

Dependency-free Node service that fronts the **multi-LLM brain** and the **OpenCode hands**.
This is the "Custom Connector: Sentinel Backend API" in the enterprise architecture.

## Run
```bash
npm start        # http://localhost:8899   (Node 18+; uses global fetch)
```

## Endpoints
- `GET  /health`
- `POST /api/llm/analyze`  `{ system, context }` → `{ content }`
- `POST /api/opencode/:op` `{ action, files, opts }` → `{ success, ... }`
  (`op` = write-feature | fix-bug | refactor | generate-docs | execute)

Swap providers with `LLM_PROVIDER`. Keys are read from env only. Deploy on Render/Azure/containers.
