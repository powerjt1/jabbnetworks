# JABB Sentinel — Local Edition ($0, 100% private)

Everything runs on your machine. No cloud, no accounts, no cost.

## 1. Ollama (the brain)
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1
ollama pull deepseek-coder:6.7b     # coding
OLLAMA_ORIGINS=* ollama serve       # let the browser app reach it
```

## 2. OpenCode (the hands, optional)
Install the OpenCode CLI (https://opencode.ai). Without it, the orchestrator returns clearly
marked simulated results so the plan→execute→validate loop still completes.

## 3. Run
- **Zero install:** open `public/mission-control.html` in Chrome/Edge — full dashboard, offline.
- **App:** `cd jabb-sentinel && npm install && npm run dev` → http://localhost:5173.
- **Backend:** `cd jabb-sentinel-backend && npm start` (defaults to `LLM_PROVIDER=ollama`).

## Privacy
No telemetry, no external scripts, no data exfiltration. Models, prompts, and outputs stay on
your device. Cloud providers are opt-in via keys you enter yourself.
