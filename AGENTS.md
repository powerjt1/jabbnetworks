# JABB NETWORKS — MASTER AGENT TEMPLATE

> **START HERE. Do not start over.** This file is the single source of truth for any
> agent (human or AI) picking up work on JABB Networks. Read it top to bottom, then
> continue the existing project — never rebuild from scratch.

Operator: **Alexander Thorpe** — always greet as **“Hi Alexander.”**
Founder/legacy persona: **Legacy** (CEO of all agents), 1995 → present.

---

## 0) THE TWO-OUTPUT CONTRACT  ⭐ (MANDATORY — every task, every agent)

Every change you make MUST produce **two outputs**:

**Output 1 — Git (canonical): a NEW branch under “Mother.”**
- **Mother = `powerjt1/Master`** (the canonical repo). This is home base.
- Create a **new branch per task**, named `agent/<yourname>-<short-task>`
  (e.g., `agent/jarvis-add-billing-view`, `agent/workspace-gmail-triage`).
- Commit there and **open a Pull Request into `Master:main`**. Never push straight to `main`.
- The JABB Networks app lives under **`jabb-networks/`** in Mother. Put app changes there.
- Do **not** touch the Ivy Building Management files at the repo root.
- Mirrors kept in sync (optional, ask first): `powerjt1/jabb-mission-control` (`main`),
  `powerjt1/jabbnetworks` (feature branch). Mother is authoritative.

**Output 2 — a downloadable HTML change preview the operator can open instantly.**
- Produce a single, self-contained `.html` file summarizing **what you changed and why**,
  with before/after notes and (for UI work) the rendered/screenshotted screen inline.
- Use the reusable template at **`templates/change-preview.template.html`** — fill in the
  `{{PLACEHOLDERS}}`. Keep it self-contained (no external requests except Google Fonts).
- Deliver it as a **download** (in Claude Code: `SendUserFile`), and also commit it to the
  branch under `previews/<date>-<short-task>.html`.

If you can only do one before running out of room, do **Output 1** (git) first, then Output 2.

---

## 1) WHAT THIS PROJECT IS

A JARVIS-themed **“Hermes Mission Control”** dashboard for JABB Networks (a Microsoft
Power Platform + web/hosting consultancy) plus supporting pieces. It is deliberately
**self-contained and offline-first**, defaulting to **free local AI models**.

Key surfaces:
- **`jabb-networks/public/mission-control.html`** — the whole dashboard, one self-contained
  file (HTML + CSS + JS, no build step, no external scripts except Google Fonts and the
  optional in-browser model libraries loaded on demand). **This is where most work happens.**
- **`jabb-networks/open-coder-bridge.mjs`** — a dependency-free Node bridge (run on the
  operator’s PC): proxies Ollama/LM Studio, serves the dashboard, does Google Calendar
  OAuth for RTR events, and proxies SerpAPI (Google Jobs).
- **`jabb-networks/extension/`** — a Manifest V3 Chrome extension: hands-free voice + live
  video (webcam/screen) connection to the crew and free local models.
- **`jabb-networks/src/`, `index.html`** — the Svelte/Vite marketing site (jabbnetworks.com),
  with nav links to `/mission-control.html`.
- **`jabb-networks/public/opencoder-lite.html`** — an older standalone AI chat tool.

---

## 2) THE CREW (agents in the dashboard)

Public crew (shown in Agents/Comms/Home, editable, saved to `localStorage`):
| id | name | role | default model | notes |
|----|------|------|---------------|-------|
| `jarvis` | JARVIS | Orchestrator | Nemotron (Ollama) | greets operator, routes work, voices replies |
| `scout` | Talent Scout | Remote jobs + RTR | Nemotron | remote-only Power Platform jobs, RTR→calendar |
| `architect` | Power Platform Architect | Solution design | Nemotron | Power Apps/Automate/BI/Copilot Studio |
| `ops` | Ops & Client Success | Proposals/hosting/comms | Nemotron | proposals, website+hosting, summaries |
| `notebook` | Notebook | Research (Gemini Notebook) | Gemini 2.0 Flash | synthesis; “Open in Gemini Notebook” |
| `workspace` | Workspace | Google & cloud ops | Gemini 2.0 Flash | Gmail, Drive/OneDrive, Sheets, Docs, Apps Script |

VIP (Board Room only, hidden from normal crew via `publicCrew()`):
| id | name | role | model | notes |
|----|------|------|-------|-------|
| `legacy` | Legacy | CEO · Chief of All Agents | Claude Fable | password-gated Board Room; owns the 1995→2025 journey |

Each agent object: `{ id, name, role, color, glyph, model, tools[], tag, prompt, avatar?, vip? }`.
Agents support an **uploaded avatar image** (`a.avatar`, a resized data URL) that overrides the
helmet portrait everywhere; else an inline-SVG helmet portrait is drawn (`portraitSVG(a)`).

Models available (`defaultModels()`): Nemotron/Llama/Qwen via Ollama, LM Studio, free
in-browser CPU (transformers.js) & GPU (WebLLM), OpenAI GPT-4o, **Claude Sonnet**,
**Claude Fable (`claude-fable-5`)**, **Google Gemini 2.0 Flash / 1.5 Pro**.

---

## 3) VIEWS (single-page app, switched by `go(view)`)

`home` · `agents` · `comms` · `schedule` (Talent Scout jobs + RTR) · `library`
(company KB + Crew Documents) · `control` (models, endpoints, voice, reports) ·
`boardroom` (🔒 VIP: CEO Legacy + 1995→2025 journey timeline).

Layout: **left sidebar nav** + slim app-bar (view title, mission clock, mic/auto-speak).
Aesthetic: **dark glassmorphism** — `--accent` cyan `#22d3ee`, `--gold` `#f5c542`,
`--violet` `#a78bfa`; `.glass` cards; Orbitron display font. **Keep this look.**

---

## 4) STATE (localStorage, prefix `jabb.`)

`settings` (ollama/openai/anthropic/serpapi/gemini) · `prefs` (operator/feed/greet) ·
`crew` · `models` (custom) · `chats` · `activeAgent` · `selectedAgent` · `jobs` ·
`pipeline` · `taskLog` · `tokens` · `docs` · `orders` (standing orders) · `voice` ·
`boardpass` (SHA-256 of the Board Room passcode).

---

## 5) HOW TO EXTEND (common recipes)

- **Add a model** → push an entry into `defaultModels()`; if it needs a key/provider,
  handle it in `streamChat()` (see the `gemini` branch as a pattern) and add a key field
  in Control → Endpoints + `settings`.
- **Add an agent** → add to `defaultCrew()` (+ `AGENT_STATS`, `QUICKS`); the migration
  block auto-adds new default agents for existing users. Mark `vip:true` to keep it out of
  the normal crew and inside the Board Room.
- **Add a tool** → add to the `TOOLS` catalog; wire any context injection in `sendChat()`
  (see how `company-kb`/`jobs`/`calendar` are injected into the system prompt).
- **Add a view** → add a `<section class="view" id="view-x">`, a sidebar `<button data-view="x">`,
  a `VIEW_TITLES` entry, and a `render X()` call in `go()`.

---

## 6) DEFINITION OF DONE (run before every PR)

1. **Parse-check** the dashboard JS:
   `node -e "const s=require('fs').readFileSync('jabb-networks/public/mission-control.html','utf8');new Function(s.match(/<script>([\\s\\S]*)<\\/script>/)[1]);console.log('JS OK')"`
2. **Build** the site (if `src/` touched): `cd jabb-networks && npm i && npm run build`.
3. **Render-check** with the preinstalled Chromium (no downloads):
   `playwright-core` + `executablePath:'/opt/pw-browsers/chromium'`; load the file, assert
   **0 `pageerror`s**, screenshot each touched view.
4. Keep changes **self-contained** (no new external hosts; CSP-safe for the extension).
5. Produce **both outputs** (§0). Open the PR into `Master:main`. Report what changed.

---

## 7) GUARDRAILS

- Never delete or overwrite the Ivy files at Mother’s root.
- Never push straight to `Master:main` — always a task branch + PR.
- Keep the glassy JARVIS aesthetic and the helmet portrait system.
- The Board Room passcode is **client-side only** (localStorage) — it gates the UI on one
  browser; it is not server-enforced auth. Don’t claim otherwise.
- Local models need `OLLAMA_ORIGINS=* ollama serve`; cloud/Gemini/Fable need the operator’s
  keys (stored only in the browser). Everything degrades gracefully without them.

---

_Last updated by an agent: keep this file current when the architecture changes._
