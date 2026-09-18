# 🛡️ JABB Sentinel — The Guardian of Your AI Agents

> Enterprise-grade AI mission control with multi-LLM support, autonomous coding, and real-time vigilance.
>
> **Built by Julio Thorpe | JABB Networks**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-orange)

---

## 🎯 What is JABB Sentinel?

JABB Sentinel is a **multi-tier AI mission control system** that monitors, orchestrates, and protects your AI agents. It works with:

- 🟣 **Claude** (Anthropic)
- 🟢 **ChatGPT** (OpenAI)
- 🔵 **Azure OpenAI** (Enterprise)
- 🟡 **Ollama** (Local — FREE)
- ⚡ **OpenCode** (Autonomous coding agent — FREE)

**Three editions, one codebase:**

| Edition | Target | Cost | Privacy |
|---------|--------|------|---------|
| **Local** | Single user / indie devs | $0/mo | 100% local |
| **Business** | Small businesses | $25-40/user/mo | Cloud (US) |
| **Enterprise** | Regulated industries | $50-100/user/mo | HIPAA/FedRAMP |

---

## ✨ Features

- 🛡️ **Multi-LLM Guardian** — Swap Claude/ChatGPT/Azure/Ollama with one env variable
- ⚡ **Autonomous Coding** — OpenCode integration writes, tests, and refactors code
- 👁️ **Real-Time Vigilance** — Live telemetry feeds and agent health monitoring
- 🏛️ **Enterprise Ready** — HIPAA, SOX, FedRAMP compliant architecture
- 🔐 **100% Private Mode** — Run entirely offline with Ollama + OpenCode
- 🎨 **Dark Mode UI** — Beautiful SvelteKit interface with Sentinel theme
- 🚀 **Zero-Cost Option** — $0/month with local LLMs

---

## 🗂️ Repository structure

```
jabbnetworks/
├── jabb-sentinel/               # Main product — SvelteKit app (landing + dashboard)
├── jabb-sentinel-backend/       # Node.js backend (multi-LLM + OpenCode bridge)
├── jabb-sentinel-enterprise/    # Power Platform edition (Power Apps + Power Automate)
├── docs/
│   ├── architecture.md          # Reference architecture (Azure AI Foundry mesh)
│   ├── LocalStack.md            # Local Edition — $0, 100% private setup
│   └── enterprise.md            # Enterprise Edition — GRC, ALM, Managed Identity
├── GoLive_v1.md                 # Go-live playbook
└── README.md                    # You are here
```

The original self-contained dashboard also ships as `public/mission-control.html`
(no build step) and is embedded by the SvelteKit app at `/dashboard`.

---

## 🚀 Quick Start (Local Edition — $0/month)

### 1. Install Ollama

```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1
ollama pull deepseek-coder:6.7b
# Allow the browser app to reach Ollama:
OLLAMA_ORIGINS=* ollama serve
```

### 2. Run the backend (multi-LLM + OpenCode bridge)

```bash
cd jabb-sentinel-backend
npm install
cp .env.example .env      # defaults to LLM_PROVIDER=ollama (free)
npm start                 # http://localhost:8899
```

### 3. Run the app

```bash
cd jabb-sentinel
npm install
npm run dev               # http://localhost:5173  →  "Activate Sentinel"
```

No install at all? Just open `public/mission-control.html` in Chrome/Edge — the full
dashboard runs offline; connect Ollama for local replies.

---

## 🔀 Switch LLMs with one variable

```bash
# jabb-sentinel-backend/.env
LLM_PROVIDER=ollama      # ollama | openai | anthropic | azure | gemini
LLM_MODEL=llama3.1
# OPENAI_API_KEY=...      ANTHROPIC_API_KEY=...      AZURE_OPENAI_ENDPOINT=...
```

---

## 🏛️ Editions & docs

- **Local** — see **[`docs/LocalStack.md`](docs/LocalStack.md)** ($0, 100% private).
- **Business** — hosted Power Platform + Azure OpenAI. Contact JABB Networks.
- **Enterprise** — see **[`docs/enterprise.md`](docs/enterprise.md)** and the
  **[reference architecture](docs/architecture.md)** (Azure AI Foundry, Dataverse, Purview,
  Entra ID P2, DLP; SOC 2 / ISO 27001 / NIST aligned; supports PCI-DSS and HIPAA/HITRUST).
- **Go-live** — see **[`GoLive_v1.md`](GoLive_v1.md)**.

Every agent follows the **two-output contract** in **[`AGENTS.md`](AGENTS.md)**.

---

Built by **Julio Thorpe** · JABB Networks · info@jabbnetworks.com — Version 1.0.0
· 100% Free • 100% Private • 100% Yours
