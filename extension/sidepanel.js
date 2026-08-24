/* JABB Networks · JARVIS — Voice & Video side panel
   - Video connection: webcam or screen share (getUserMedia / getDisplayMedia)
   - Voice connection: continuous speech-to-text -> AI crew -> text-to-speech
   - Talks to free local models (Ollama/Nemotron), LM Studio, or cloud.
   All self-contained (MV3 CSP-safe): no remote scripts. */

const $ = (id) => document.getElementById(id);

/* ---------- Settings (chrome.storage.local) ---------- */
const DEFAULTS = {
  operator: "Alexander",
  provider: "ollama",
  model: "nemotron-mini",
  base: "http://localhost:11434",
  key: "",
  mc: "http://localhost:8899/mission-control",
};
let cfg = { ...DEFAULTS };

function loadCfg() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get("jarvisCfg", (r) => { cfg = { ...DEFAULTS, ...(r?.jarvisCfg || {}) }; resolve(cfg); });
    } catch { resolve(cfg); }
  });
}
function saveCfg() { try { chrome.storage.local.set({ jarvisCfg: cfg }); } catch {} }

/* ---------- Crew personas ---------- */
const CREW = {
  jarvis: { name: "JARVIS", glyph: "🛰", prompt: "You are JARVIS, orchestrating AI for JABB Networks, serving {OP}. Greet as 'Hi {OP}'. You coordinate a crew (Talent Scout for remote Power Platform jobs + RTR scheduling, Power Platform Architect, Ops & Client Success). Be concise, calm and capable. This is a VOICE conversation — keep replies short, natural and speakable; avoid long code unless asked." },
  scout: { name: "Talent Scout", glyph: "✈", prompt: "You are Talent Scout for {OP}, a recruiter specializing in REMOTE-ONLY Microsoft Power Platform roles (Power Apps, Power Automate, Power BI, Copilot Studio, Dynamics 365). Recommend remote roles, tailor applications, and explain RTR (Right to Represent) etiquette. Voice conversation — keep it short and clear." },
  architect: { name: "Power Platform Architect", glyph: "🧠", prompt: "You are the Power Platform Architect at JABB Networks, serving {OP}. Expert in Power Apps, Power Automate, Power BI, Copilot Studio, Dataverse, Dynamics 365 and web app + hosting. Give buildable guidance. Voice conversation — be concise unless asked to go deep." },
  ops: { name: "Ops & Client Success", glyph: "✉", prompt: "You are Ops & Client Success at JABB Networks, serving {OP}. Draft proposals/emails, answer website + hosting questions, map needs to plans. Warm and concise. Voice conversation — keep replies short." },
};
let agentId = "jarvis";
let history = []; // {role, content}

/* ---------- Media / video connection ---------- */
let stream = null, mode = null; // 'cam' | 'screen'
async function startCam() {
  stopMedia();
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    $("video").srcObject = stream; mode = "cam";
    $("videoOff").style.display = "none";
    $("camBtn").classList.add("on"); $("screenBtn").classList.remove("on");
    renderBadges(); setStatus("camera live");
  } catch (e) { showErr("Camera blocked: " + e.message); }
}
async function startScreen() {
  stopMedia();
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    $("video").srcObject = stream; mode = "screen";
    $("videoOff").style.display = "none";
    $("screenBtn").classList.add("on"); $("camBtn").classList.remove("on");
    stream.getVideoTracks()[0].addEventListener("ended", stopMedia);
    renderBadges(); setStatus("screen sharing");
  } catch (e) { showErr("Screen share cancelled: " + e.message); }
}
function stopMedia() {
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  $("video").srcObject = null; mode = null;
  $("videoOff").style.display = "grid";
  $("camBtn").classList.remove("on"); $("screenBtn").classList.remove("on");
  renderBadges(); setStatus("standby");
}
function renderBadges() {
  const b = $("vidBadges"); b.innerHTML = "";
  if (mode === "cam") b.innerHTML = '<span class="vbadge live">● CAMERA</span>';
  if (mode === "screen") b.innerHTML = '<span class="vbadge live">● SCREEN</span>';
}
function snapshot() {
  if (!stream) { showErr("Start Camera or Screen first."); return; }
  const v = $("video");
  const c = document.createElement("canvas");
  c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
  c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
  c.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "jarvis-snapshot-" + Date.now() + ".png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    addMsg("assistant", "📸 Snapshot captured and saved.");
  }, "image/png");
}

/* ---------- Voice input (Web Speech API) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null, listening = false;
function toggleMic() {
  if (!SR) { showErr("Voice input needs Chrome/Edge."); return; }
  if (listening) { recog && recog.stop(); return; }
  recog = new SR(); recog.lang = "en-US"; recog.interimResults = true; recog.continuous = false;
  let finalText = "";
  recog.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i]; r.isFinal ? (finalText += r[0].transcript) : (interim += r[0].transcript);
    }
    $("interim").textContent = (finalText + interim).trim();
  };
  recog.onerror = (e) => { showErr("Mic: " + e.error); };
  recog.onend = () => {
    listening = false; $("micBtn").classList.remove("on"); $("orb").classList.remove("talking");
    const t = $("interim").textContent.trim(); $("interim").textContent = "";
    if (t) send(t);
  };
  recog.start(); listening = true; $("micBtn").classList.add("on"); $("orb").classList.add("talking"); setStatus("listening…");
}

/* ---------- Voice output ---------- */
let autoSpeak = true;
function pickVoice() {
  const vs = window.speechSynthesis?.getVoices?.() || [];
  return vs.find((v) => /daniel|arthur|google uk english male/i.test(v.name)) || vs.find((v) => /en-GB/i.test(v.lang)) || vs.find((v) => /en/i.test(v.lang)) || vs[0];
}
function speak(text) {
  if (!autoSpeak || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/```[\s\S]*?```/g, " code block ").replace(/[`*_#>]/g, "").slice(0, 3000);
  const u = new SpeechSynthesisUtterance(clean); const v = pickVoice(); if (v) u.voice = v; u.rate = 1.02; u.pitch = 0.95;
  u.onstart = () => $("orb").classList.add("talking"); u.onend = () => $("orb").classList.remove("talking");
  window.speechSynthesis.speak(u);
}

/* ---------- Model calls ---------- */
function baseUrl() {
  if (cfg.provider === "gemini") return "https://generativelanguage.googleapis.com/v1beta/openai";
  let b = (cfg.base || "").replace(/\/$/, "");
  if ((cfg.provider === "ollama" || cfg.provider === "openai-compat" || cfg.provider === "openai") && !/\/v1$/.test(b)) b += "/v1";
  return b;
}
async function streamModel(system, hist, onChunk) {
  if (cfg.provider === "anthropic") return streamAnthropic(system, hist, onChunk);
  const key = cfg.key || "not-needed";
  const msgs = [{ role: "system", content: system }, ...hist];
  const resp = await fetch(baseUrl() + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + key },
    body: JSON.stringify({ model: cfg.model, messages: msgs, stream: true, temperature: 0.7, top_p: 0.9 }),
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status + " from " + baseUrl());
  await readSSE(resp, (o) => { const c = o.choices?.[0]?.delta?.content; if (c) onChunk(c); });
}
async function streamAnthropic(system, hist, onChunk) {
  if (!cfg.key) throw new Error("Set your Anthropic API key in settings.");
  const resp = await fetch((cfg.base || "https://api.anthropic.com").replace(/\/$/, "") + "/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: cfg.model, max_tokens: 1024, system, stream: true, temperature: 0.7, messages: hist }),
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status + " from Anthropic");
  await readSSE(resp, (o) => { if (o.type === "content_block_delta" && o.delta?.text) onChunk(o.delta.text); });
}
async function readSSE(resp, onObj) {
  const reader = resp.body.getReader(); const dec = new TextDecoder(); let buf = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) { const t = line.trim(); if (!t.startsWith("data:")) continue; const d = t.slice(5).trim(); if (d === "[DONE]" || !d) continue; try { onObj(JSON.parse(d)); } catch {} }
  }
}

/* ---------- Chat flow ---------- */
let busy = false;
async function send(text) {
  text = (text || $("textInput").value).trim();
  if (!text || busy) return;
  showErr("");
  $("textInput").value = "";
  addMsg("user", text);
  history.push({ role: "user", content: text });
  const persona = CREW[agentId];
  const system = persona.prompt.replaceAll("{OP}", cfg.operator || "Alexander");
  const el = addMsg("assistant", "");
  busy = true; $("orb").classList.add("talking"); setStatus("thinking…");
  let acc = "";
  try {
    await streamModel(system, history, (chunk) => { acc += chunk; el.querySelector(".body").textContent = acc; $("log").scrollTop = $("log").scrollHeight; });
    history.push({ role: "assistant", content: acc });
    speak(acc);
    setStatus("ready");
  } catch (e) {
    el.remove();
    let m = e.message || "Request failed.";
    if (cfg.provider === "ollama") m = "Ollama unreachable: " + m + " — run  OLLAMA_ORIGINS=* ollama serve  and  ollama pull " + cfg.model + ". Or open ⚙ settings.";
    else if (m.includes("Failed to fetch")) m = "Couldn't reach the model. Check base URL / host permission in ⚙ settings. (Bridge/LAN hosts need the extension granted access.)";
    showErr(m); setStatus("error");
  } finally { busy = false; $("orb").classList.remove("talking"); }
}

/* ---------- UI helpers ---------- */
function addMsg(role, content) {
  const empty = $("log").querySelector(".empty"); if (empty) empty.remove();
  const wrap = document.createElement("div"); wrap.className = "msg " + role;
  const persona = CREW[agentId];
  wrap.innerHTML = `<div class="bub ${role}"><div class="rn">${role === "user" ? (cfg.operator || "You") : persona.name}</div><div class="body"></div></div>`;
  wrap.querySelector(".body").textContent = content;
  $("log").appendChild(wrap); $("log").scrollTop = $("log").scrollHeight;
  return wrap;
}
function showErr(m) { const e = $("err"); e.textContent = m; e.style.display = m ? "block" : "none"; }
function setStatus(s) { $("statusLine").textContent = "Voice & Video · " + s; }
function greet() {
  const p = CREW[agentId];
  const line = `Hi ${cfg.operator || "Alexander"}. ${p.name} online. How can I help?`;
  addMsg("assistant", line);
  history = [{ role: "assistant", content: line }];
  speak(line);
}

/* ---------- Wire up ---------- */
$("camBtn").onclick = () => (mode === "cam" ? stopMedia() : startCam());
$("screenBtn").onclick = () => (mode === "screen" ? stopMedia() : startScreen());
$("snapBtn").onclick = snapshot;
$("micBtn").onclick = toggleMic;
$("speakBtn").onclick = () => { autoSpeak = !autoSpeak; $("speakBtn").classList.toggle("on", autoSpeak); if (!autoSpeak) window.speechSynthesis?.cancel(); };
$("sendBtn").onclick = () => send();
$("textInput").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
$("mcBtn").onclick = () => { const u = cfg.mc || DEFAULTS.mc; try { chrome.tabs.create({ url: u }); } catch { window.open(u, "_blank"); } };
$("agentSel").onchange = (e) => { agentId = e.target.value; $("log").innerHTML = ""; greet(); };

$("openSettings").onclick = () => {
  $("s_operator").value = cfg.operator; $("s_provider").value = cfg.provider; $("s_model").value = cfg.model;
  $("s_base").value = cfg.base; $("s_key").value = cfg.key; $("s_mc").value = cfg.mc;
  $("settings").classList.add("open");
};
$("closeSettings").onclick = () => $("settings").classList.remove("open");
$("saveSettings").onclick = () => {
  cfg = {
    operator: $("s_operator").value.trim() || "Alexander",
    provider: $("s_provider").value,
    model: $("s_model").value.trim() || "nemotron-mini",
    base: $("s_base").value.trim() || "http://localhost:11434",
    key: $("s_key").value.trim(),
    mc: $("s_mc").value.trim() || DEFAULTS.mc,
  };
  saveCfg(); $("settings").classList.remove("open"); setStatus("connection saved");
};

/* ---------- Init ---------- */
(async () => {
  await loadCfg();
  $("speakBtn").classList.toggle("on", autoSpeak);
  $("log").innerHTML = '<div class="empty">Press <b>🎤 Talk</b> to speak with your crew, or turn on <b>🎥 Camera</b> / <b>🖥 Screen</b> for a video connection.<br><br>Default model: <b>Nemotron via Ollama</b>. Change it in ⚙.</div>';
  if ("speechSynthesis" in window) { window.speechSynthesis.onvoiceschanged = () => {}; window.speechSynthesis.getVoices(); }
  setTimeout(greet, 500);
})();
