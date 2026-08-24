# JABB Networks · JARVIS Voice & Video (Chrome extension)

A Manifest V3 Chrome extension that gives you a hands-free **voice + live video** connection
to your JABB Networks crew and free local AI models — from a side panel in any tab.

## Features
- **Voice connection** — continuous speech-to-text → crew reply → text-to-speech. Talk to
  JARVIS, Talent Scout, the Power Platform Architect, or Ops & Client Success hands-free.
- **Video connection** — webcam or screen share preview, plus a snapshot capture.
- **Model-agnostic** — defaults to NVIDIA Nemotron via Ollama; switch to LM Studio / OpenAI /
  Anthropic in ⚙ settings. Voice works the same across every model.
- **Greets you by name** ("Hi Alexander") and opens Mission Control in a tab.

## Install (developer mode)
1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin the extension and click its icon — the JARVIS side panel opens.

## Connect a model
- **Ollama (recommended, free):** run `OLLAMA_ORIGINS=* ollama serve` and
  `ollama pull nemotron-mini`. In ⚙ settings keep provider **Ollama**, base
  `http://localhost:11434`.
- **PC bridge / LAN:** point the base at `http://<bridge-ip>:8899/proxy/ollama`. For a LAN or
  cloud host, grant the extension access when Chrome prompts (optional host permissions).
- **Cloud:** choose OpenAI or Anthropic and paste your key (stored locally in the browser).

## Permissions
- `sidePanel`, `storage`, `tabs` — panel UI, saved settings, open Mission Control.
- Camera & microphone are requested by the browser on first use (for video/voice).
- Host access is limited to `localhost`/`127.0.0.1` and the OpenAI/Anthropic APIs by default;
  other hosts are optional and granted on demand.

Everything runs locally in your browser — no analytics, no external scripts.
