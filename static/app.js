/* Cambio scorekeeper — vanilla JS frontend */
"use strict";



let state = { players: [], games: [], sessions: [] };
let route = parseHash();

// Per-device session choice: this device remembers which session it works in.
const SESSION_KEY = "cambio-session";
let activeSessionId = null;
let addingSession = false;
let editingRoundId = null;
let renamingPlayerId = null;
let statsSort = { key: "mean", dir: 1 };
const STATS_VIEW_KEY = "cambio-stats-view";
let statsView = (() => { try { return localStorage.getItem(STATS_VIEW_KEY) === "table" ? "table" : "cards"; } catch (e) { return "cards"; } })();
let pendingFocusFirstInput = false;
let loadError = null;

// ---------- tiny DOM helper ----------
const SVG_TAGS = new Set(["svg", "path", "circle", "line", "rect", "g", "polyline", "polygon", "ellipse", "text", "defs", "clipPath"]);
function el(tag, attrs = {}, ...children) {
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    // setAttribute works for both HTML and SVG nodes — assigning .className
    // throws on SVG elements (getter-only property)
    if (k === "class") node.setAttribute("class", v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

// ---------- api ----------
async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

async function refresh() {
  try {
    state = await api("GET", "/api/state");
    loadError = null;
    store.saveSnapshot(state);
  } catch (e) {
    if (isNetError(e)) {
      const cached = cachedState();
      if (cached) { state = cached; loadError = null; }
      else loadError = "You're offline and this device has no saved data yet.";
    } else loadError = e.message;
  }
  resolveActiveSession();
  render();
}

// Resolve which session this device is working in: the last one it picked
// (localStorage), or the server's first session if none was picked yet.
function resolveActiveSession() {
  let saved = null;
  try { saved = localStorage.getItem(SESSION_KEY); } catch {}
  if (saved && state.sessions.some((s) => s.id === saved)) activeSessionId = saved;
  else activeSessionId = state.sessions.length ? state.sessions[0].id : null;
}

function setActiveSession(id) {
  activeSessionId = id;
  addingSession = false;
  try { localStorage.setItem(SESSION_KEY, id); } catch {}
}

// ---------- offline store + sync ----------
// localStorage mirror so the app keeps working without internet:
//   snapshot — last full /api/state (offline reads)
//   dirty    — games with changes not yet on the server (full state, upserted via /api/sync)
//   deleted  — game ids removed locally while offline
//   players  — players created offline, not yet on the server
const OFFLINE_KEY = "cambio-offline";

function storeBlank() { return { snapshot: null, dirty: {}, deleted: [], players: [] }; }
function storeRead() {
  try {
    const s = JSON.parse(localStorage.getItem(OFFLINE_KEY));
    return s && typeof s === "object" ? { ...storeBlank(), ...s } : storeBlank();
  } catch { return storeBlank(); }
}
function storeWrite(s) {
  try { localStorage.setItem(OFFLINE_KEY, JSON.stringify(s)); } catch {}
}
const store = {
  read: storeRead,
  saveSnapshot(state) { const s = storeRead(); s.snapshot = state; storeWrite(s); },
  // persist a locally changed game: into the dirty map AND into the snapshot (offline reads)
  markDirty(game) {
    const s = storeRead();
    s.dirty[game.id] = game;
    s.deleted = s.deleted.filter((x) => x !== game.id);
    if (s.snapshot) {
      const i = s.snapshot.games.findIndex((g) => g.id === game.id);
      if (i >= 0) s.snapshot.games[i] = game; else s.snapshot.games.push(game);
    }
    storeWrite(s);
  },
  addPlayer(p) {
    const s = storeRead();
    if (!s.players.some((x) => x.id === p.id)) s.players.push(p);
    if (s.snapshot && !s.snapshot.players.some((x) => x.id === p.id)) s.snapshot.players.push(p);
    storeWrite(s);
  },
  deleteGame(gid) {
    const s = storeRead();
    if (s.dirty[gid]) delete s.dirty[gid];
    else if (s.snapshot && s.snapshot.games.some((g) => g.id === gid)) s.deleted.push(gid);
    if (s.snapshot) s.snapshot.games = s.snapshot.games.filter((g) => g.id !== gid);
    storeWrite(s);
  },
  pendingCount() { const s = storeRead(); return Object.keys(s.dirty).length + s.deleted.length + s.players.length; },
  clearPending() { const s = storeRead(); s.dirty = {}; s.deleted = []; s.players = []; storeWrite(s); },
};

// state as it exists on this device: last server snapshot with local changes merged in
function cachedState() {
  const s = storeRead();
  if (!s.snapshot) return null;
  const st = JSON.parse(JSON.stringify(s.snapshot));
  for (const g of Object.values(s.dirty)) {
    const i = st.games.findIndex((x) => x.id === g.id);
    if (i >= 0) st.games[i] = g; else st.games.push(g);
  }
  st.games = st.games.filter((g) => !s.deleted.includes(g.id));
  for (const p of s.players) if (!st.players.some((x) => x.id === p.id)) st.players.push(p);
  return st;
}

function isNetError(e) { return e instanceof TypeError; }
function newId(prefix) {
  const rnd = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix + rnd.slice(0, 10);
}
function autoGameName() {
  const d = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let base = `${days[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
  if (d.getFullYear() !== new Date().getUTCFullYear()) base += ` ${d.getFullYear()}`;
  return base;
}

let syncing = false;
async function syncNow(manual = false) {
  if (syncing || !navigator.onLine) { updateSyncIcon(); return; }
  const s = storeRead();
  const games = Object.values(s.dirty);
  if (!games.length && !s.deleted.length && !s.players.length) { updateSyncIcon(); return; }
  syncing = true;
  try {
    for (const gid of s.deleted) {
      try { await api("DELETE", `/api/games/${gid}`); }
      catch (e) { if (isNetError(e)) throw e; /* 404: never reached the server */ }
    }
    if (games.length || s.players.length) await api("POST", "/api/sync", { players: s.players, games });
    store.clearPending();
    await refresh();
  } catch (e) {
    if (!isNetError(e) && manual) alert(e.message);
  } finally {
    syncing = false;
    updateSyncIcon();
  }
}

// finish a mutation that was applied locally (offline, or queued on a dirty game)
function localApplied() {
  render();
  if (navigator.onLine) syncNow(); else updateSyncIcon();
}

function syncSvg(kind) {
  const cloud = '<path d="M6.5 18a3.5 3.5 0 0 1-.42-6.98A5 5 0 0 1 15.7 9.1 4.5 4.5 0 0 1 17.5 18h-11z"/>';
  let extra = "";
  if (kind === "synced") extra = '<path d="m9.3 13.6 2 2 3.4-3.4"/>';
  else if (kind === "pending") extra = '<path d="M12 17v-5M10 14l2-2 2 2"/>';
  else extra = '<line x1="4" y1="4" x2="20" y2="20"/>';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">${cloud}${extra}</svg>`;
}

function updateSyncIcon() {
  const pending = store.pendingCount();
  const online = navigator.onLine;
  const kind = !online ? "offline" : pending ? "pending" : "synced";
  const label = !online
    ? "Offline — changes are saved on this device"
    : pending ? `${pending} unsynced change${pending > 1 ? "s" : ""} — tap to sync`
    : "All changes synced";
  for (const node of document.querySelectorAll("[data-sync]")) {
    node.dataset.syncState = kind;
    node.innerHTML = syncSvg(kind);
    if (node.classList.contains("sync-status")) {
      const span = document.createElement("span");
      span.textContent = label;
      node.append(span);
    } else {
      node.title = label;
      node.setAttribute("aria-label", label);
      node.classList.toggle("has-pending", pending > 0 && online);
    }
  }
}

// ---------- helpers ----------
// ---------- theme ----------
const THEME_KEY = "cambio-theme";
function currentTheme() { return document.documentElement.dataset.theme || "dark"; }
function syncThemeColor() {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  const b = document.getElementById("brandLogo");
  if (b) b.src = currentTheme() === "light" ? "/icons/cambio-logo_black.svg" : "/icons/cambio-logo_white.svg";
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  syncThemeColor();
}
function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
  render();
}

// brand logo chip — theme-aware: white plate on dark backgrounds, dark plate on light
function logoChip(cls = "suit") {
  const light = document.documentElement.dataset.theme === "light";
  return el("span", { class: cls },
    el("img", { class: "logo-chip", src: light ? "/icons/cambio-logo_black.svg" : "/icons/cambio-logo_white.svg", alt: "", "aria-hidden": "true" }));
}
function initialsOf(name) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
function playerById(id) { return state.players.find((p) => p.id === id); }
function gameById(id) { return state.games.find((g) => g.id === id); }
// Games of the session this device is currently working in, creation order.
function sessionGames() {
  if (!activeSessionId) return state.games;
  return state.games.filter((g) => g.session_id === activeSessionId);
}
function latestGame() { const gs = sessionGames(); return gs.length ? gs[gs.length - 1] : null; }
function activeSession() { return state.sessions.find((s) => s.id === activeSessionId) || null; }
// Players registered in the session this device is working in.
function sessionPlayers() {
  if (!activeSessionId) return state.players;
  return state.players.filter((p) => p.session_id === activeSessionId);
}

// stats scoped to a list of games: per player across all their rounds in them
function computeStats(games) {
  const out = {};
  for (const g of games) {
    for (const r of g.rounds) {
      const entries = Object.entries(r.scores);
      if (!entries.length) continue;
      const min = Math.min(...entries.map(([, v]) => v));
      for (const [pid, v] of entries) {
        const s = (out[pid] ??= { games: new Set(), rounds: 0, total: 0, wins: 0, best: Infinity, worst: -Infinity });
        s.games.add(g.id);
        s.rounds += 1;
        s.total += v;
        if (v === min) s.wins += 1; // strictly lowest; ties share the win
        if (v < s.best) s.best = v;
        if (v > s.worst) s.worst = v;
      }
    }
  }
  return out;
}

function parseHash() {
  const m = location.hash.match(/^#\/(game|stats|players|sessions)(?:\/([^/]+))?$/);
  if (!m) return { view: "game", gameId: null };
  return { view: m[1], gameId: m[2] || null };
}

// ---------- confirm dialog ----------
function confirmDialog(title, body, okLabel = "Delete") {
  return new Promise((resolve) => {
    const dlg = document.getElementById("confirmDialog");
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmBody").textContent = body;
    const ok = document.getElementById("confirmOk");
    const cancel = document.getElementById("confirmCancel");
    ok.textContent = okLabel;
    let done = false;
    const finish = (v) => { if (!done) { done = true; ok.removeEventListener("click", onOk); cancel.removeEventListener("click", onCancel); dlg.close(); resolve(v); } };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    ok.addEventListener("click", onOk);
    cancel.addEventListener("click", onCancel);
    dlg.addEventListener("close", () => finish(false), { once: true });
    dlg.showModal();
  });
}

// ---------- top bar + nav ----------
function renderChrome() {
  const game = route.gameId ? gameById(route.gameId) : null;
  document.getElementById("topbarTitle").textContent = "Cambio";
  const sub = document.getElementById("topbarSub");
  sub.textContent = "";
  let scope = "";
  const sessName = activeSession() ? activeSession().name : null;
  if (game) scope = `${game.rounds.length} rounds · ${fmtDate(game.created_at)}`;
  else if (route.view === "stats") {
    const gs = sessionGames();
    const totalRounds = gs.reduce((n, g) => n + g.rounds.length, 0);
    scope = `${sessionPlayers().length} players · ${totalRounds} rounds${sessName ? ` in ${sessName}` : ""}`;
  } else if (route.view === "players") scope = `${sessionPlayers().length} in this session`;
  else if (route.view === "sessions") scope = `${state.sessions.length} sessions · tap one to switch`;
  if (scope) sub.textContent = scope;

  const sb = document.getElementById("topbarSession");
  if (sb) {
    sb.textContent = sessName || "";
    sb.hidden = !sessName;
    sb.title = sessName ? `Session: ${sessName} — tap to manage` : "";
  }

  const ta = document.getElementById("topbarActions");
  if (ta) {
    const dark = currentTheme() === "dark";
    ta.replaceChildren(iconBtn("toggle-theme", dark ? "Switch to light mode" : "Switch to dark mode", dark ? sunSvg() : moonSvg()));
  }

  for (const a of document.querySelectorAll("[data-nav]")) {
    if (route.view === a.dataset.nav) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  for (const v of ["game", "stats", "players", "sessions"]) {
    document.getElementById(`view-${v}`).hidden = route.view !== v;
  }
}

// ---------- game view ----------
function renderGameView() {
  const host = document.getElementById("view-game");
  host.replaceChildren();
  if (loadError) { host.append(errorNote(loadError)); return; }
  const game = route.gameId ? gameById(route.gameId) : null;
  if (!game) renderHome(host);
  else renderGame(host, game);
}

// Inline name input for a new session (home picker + Sessions tab).
function newSessionInput() {
  const inp = el("input", { class: "session-input", placeholder: "Session name…", maxlength: 30 });
  inp.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") { addingSession = false; render(); }
    else if (e.key === "Enter") {
      const name = inp.value.trim();
      if (!name) return;
      if (!navigator.onLine) { alert("You're offline — creating a session needs a connection."); return; }
      try {
        const s = await api("POST", "/api/sessions", { name });
        setActiveSession(s.id);
        await refresh();
      } catch (err) { alert(err.message); addingSession = false; render(); }
    }
  });
  return inp;
}

function renderHome(host) {
  host.append(
    el("div", { class: "title-row" },
      el("div", {}, el("h1", {}, "Games"), el("div", { class: "sub" }, "Scorekeeper for your card nights"))),
  );
  const games = sessionGames();
  if (!games.length) {
    host.append(el("div", { class: "panel stack" },
      el("p", { style: "color:var(--muted)" }, "No games in this session yet. Start tonight's game and add the players at the table."),
      el("button", { class: "btn primary", dataset: { action: "new-game" } }, "Start a game"),
    ));
    return;
  }
  const latest = latestGame();
  host.append(
    el("div", { class: "panel continue-card" },
      el("div", {},
        el("div", { class: "game-name" }, latest.name),
        el("div", { class: "meta", style: "margin-top:4px;color:var(--faint);font-size:var(--fs-small)" },
          `${latest.roster.length} players · ${latest.rounds.length} rounds`),
      ),
      el("div", { style: "display:flex;gap:8px;flex-wrap:wrap" },
        el("button", { class: "btn primary", dataset: { action: "open-game", id: latest.id } }, "Continue"),
        el("button", { class: "btn", dataset: { action: "new-game" } }, "New game")),
    ),
  );
  const past = games.slice(0, -1).reverse();
  if (past.length) {
    host.append(el("div", { class: "panel", style: "margin-top:var(--gap)" },
      el("header", {}, el("h2", {}, "Past games"), el("span", { class: "meta" }, `${past.length}`)),
      el("div", { class: "game-list" }, past.map((g) => gameRow(g)))));
  }
}

function gameRow(g) {
  return el("button", { class: "game-row", dataset: { action: "open-game", id: g.id } },
    el("div", {},
      el("div", { class: "g-name" }, g.name),
      el("div", { class: "g-meta" }, `${g.roster.length} players · ${g.rounds.length} rounds`)),
    el("svg", { class: "chev", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" }, el("path", { d: "M9 6l6 6-6 6" })),
  );
}

function renderGame(host, game) {
  const roster = game.roster.map(playerById).filter(Boolean);
  host.append(
    el("div", { class: "title-row" },
      el("div", {},
        el("h1", { id: "gameTitle" }, game.name),
        el("div", { class: "sub" }, `${fmtDate(game.created_at)} · ${roster.length} players · ${game.rounds.length} rounds`)),
      el("div", { style: "display:flex;gap:4px" },
        iconBtn("rename-game", "Rename game", pencilSvg()),
        iconBtn("delete-game", "Delete game", trashSvg())),
    ),
  );

  // roster
  const rosterPanel = el("div", { class: "panel" },
    el("header", {}, el("h2", {}, "Tonight's players"),
      roster.length ? el("span", { class: "meta" }, `${roster.length}`) : null),
  );
  if (!roster.length) {
    rosterPanel.append(el("div", { class: "empty" },
      "No players yet — add the people at the table.",
      el("button", { class: "btn primary", style: "margin-top:12px", dataset: { action: "toggle-player-menu" } }, "Add player")));
  } else {
    const rosterEl = el("div", { class: "roster" });
    for (const p of roster) rosterEl.append(playerCard(p, game));
    const addWrap = el("div", { style: "position:relative;display:inline-block" });
    addWrap.append(el("button", { class: "add-player-card", dataset: { action: "toggle-player-menu" }, "aria-label": "Add player" }, userPlusSvg()));
    rosterEl.append(addWrap);
    rosterPanel.append(rosterEl);
  }
  host.append(rosterPanel);

  // rounds
  const roundsPanel = el("div", { class: "panel", style: "margin-top:var(--gap)" },
    el("header", {}, el("h2", {}, "Rounds"),
      el("span", { class: "meta" }, game.rounds.length ? `${game.rounds.length} rounds` : "")),
  );
  if (!roster.length) {
    roundsPanel.append(el("div", { class: "empty" }, "Add players first, then score the rounds."));
  } else {
    const table = el("table", { class: "round-table" });
    const headRow = el("tr", {}, el("th", { class: "round-no" }, ""));
    for (const p of roster) headRow.append(el("th", {}, logoChip("th-suit"), p.name));
    headRow.append(el("th", { class: "round-edit" }));
    table.append(el("thead", {}, headRow));

    const tbody = el("tbody");
    game.rounds.forEach((r, i) => {
      if (editingRoundId === r.id) {
        tbody.append(entryRowEl(game, roster, r, i + 1));
      } else {
        const min = Math.min(...Object.values(r.scores));
        const tr = el("tr", { dataset: { action: "edit-round", id: r.id }, style: "cursor:pointer" },
          el("td", { class: "round-no num" }, String(i + 1)));
        for (const p of roster) {
          const v = r.scores[p.id];
          if (v === undefined) tr.append(el("td", { class: "absent num" }, "\u2013"));
          else tr.append(el("td", { class: `score num${v === min ? " winner" : ""}` }, String(v)));
        }
        tr.append(el("td", { class: "round-edit" },
          el("button", { class: "icon-btn", dataset: { action: "edit-round", id: r.id }, "aria-label": `Edit round ${i + 1}` }, pencilSvg())));
        tbody.append(tr);
      }
    });
    // the free line is always present (also at the start of a game) when not editing a round
    if (editingRoundId === null) tbody.append(entryRowEl(game, roster, null, game.rounds.length + 1));
    table.append(tbody);

    const wrap = el("div", { class: "grid-scroll" }, table);
    roundsPanel.append(wrap);

    const editing = editingRoundId !== null;
    roundsPanel.append(
      el("div", { class: "entry-actions" },
        el("span", { class: "entry-hint" }, "\u2013 or blank = not in the round"),
        el("div", { style: "display:flex;gap:8px" },
          editing
            ? el("button", { class: "btn danger", dataset: { action: "delete-round", id: editingRoundId } }, "Delete round")
            : null,
          el("button", { class: "btn", dataset: { action: editing ? "cancel-edit" : "cancel-add" } }, "Cancel"),
          el("button", { class: "btn primary", dataset: { action: editing ? "save-round" : "add-round" } },
            editing ? "Save changes" : "Add round")),
      ),
    );
  }
  host.append(roundsPanel);

  // this game's numbers
  const stats = computeStats([game]);
  const played = roster.filter((p) => stats[p.id] && stats[p.id].rounds > 0);
  if (played.length) {
    const mini = el("table", { class: "mini-table" });
    mini.append(el("thead", {}, el("tr", {},
      el("th", { style: "text-align:left" }, "Player"),
      el("th", {}, "Rounds"), el("th", {}, "Avg pts"), el("th", {}, "Wins"))));
    const mb = el("tbody");
    for (const p of played) {
      const s = stats[p.id];
      mb.append(el("tr", {},
        el("td", { class: "name-cell" }, logoChip(), p.name),
        el("td", { class: "num" }, String(s.rounds)),
        el("td", { class: "num" }, fmtMean(s.total, s.rounds)),
        el("td", { class: "num" }, String(s.wins))));
    }
    mini.append(mb);
    host.append(el("div", { class: "panel", style: "margin-top:var(--gap)" },
      el("header", {}, el("h2", {}, "This game"), el("span", { class: "meta" }, "lower avg is better")), mini));
  }
}

function playerCard(p, game) {
  const roundsPlayed = game.rounds.filter((r) => r.scores[p.id] !== undefined).length;
  const card = el("div", { class: `pcard${roundsPlayed ? " has-history" : ""}`, title: `${p.name} · ${roundsPlayed} rounds` });
  card.append(el("span", { class: "initials" }, initialsOf(p.name)));
  if (!roundsPlayed) card.append(el("button", { class: "remove", dataset: { action: "remove-from-roster", id: p.id, game: game.id }, "aria-label": `Remove ${p.name}` }, "\u00d7"));
  return card;
}

// one row of score inputs: r === null → new round entry
function entryRowEl(game, roster, r, label) {
  const tr = el("tr", { class: "entry-row" });
  tr.append(el("td", { class: "round-no num" }, String(label)));
  for (const p of roster) {
    const v = r ? r.scores[p.id] : undefined;
    tr.append(el("td", {}, el("input", {
      class: "score-input", type: "text", inputmode: "numeric", autocomplete: "off",
      dataset: { pid: p.id }, placeholder: "\u2013", value: v === undefined ? "" : String(v),
      "aria-label": `${p.name} score`,
    })));
  }
  return tr;
}

// ---------- sessions view ----------
function renderSessionsView() {
  const host = document.getElementById("view-sessions");
  host.replaceChildren();
  if (loadError) { host.append(errorNote(loadError)); return; }

  host.append(el("div", { class: "title-row" },
    el("div", {}, el("h1", {}, "Sessions"),
      el("div", { class: "sub" }, `${state.sessions.length} session${state.sessions.length === 1 ? "" : "s"} · tap one to switch this device`)),
    addingSession ? null : el("button", { class: "btn primary", dataset: { action: "new-session" } }, "New session")));

  const panel = el("div", { class: "panel" });
  const list = el("div", { class: "session-list" });
  const last = state.sessions.length <= 1;

  if (addingSession) {
    const row = el("div", { class: "session-new-row" });
    const inp = newSessionInput();
    row.append(inp, el("button", { class: "icon-btn", dataset: { action: "cancel-new-session" }, "aria-label": "Cancel new session" }, "\u00d7"));
    list.append(row);
    setTimeout(() => inp.focus(), 50);
  }

  for (const s of state.sessions) {
    const games = state.games.filter((g) => g.session_id === s.id).length;
    const players = state.players.filter((p) => p.session_id === s.id).length;
    const row = el("div", { class: "session-row" });
    row.append(
      el("div", { class: "session-row-main", dataset: { action: "select-session", id: s.id } },
        el("div", { class: "s-name" }, s.name,
          s.id === activeSessionId ? el("span", { class: "s-active-badge" }, "this device") : null),
        el("div", { class: "p-meta" }, `${games} games · ${players} players`)),
      el("button", {
        class: "icon-btn danger", dataset: { action: "delete-session", id: s.id },
        disabled: last ? "" : null,
        title: last ? "The last session can't be deleted" : `Delete ${s.name} and everything in it`,
        "aria-label": `Delete ${s.name}`,
      }, trashSvg()));
    list.append(row);
  }
  panel.append(list);
  host.append(panel);
  host.append(el("div", { class: "table-note", style: "margin-top:10px" },
    "Each session keeps its own games, players and stats. Deleting one removes everything in it."));
}

// ---------- stats view ----------
const STAT_COLS = [
  { key: "games", label: "Games" },
  { key: "rounds", label: "Rounds" },
  { key: "mean", label: "Avg pts", lower: true },
  { key: "total", label: "Total pts", lower: true },
  { key: "wins", label: "Wins" },
  { key: "winrate", label: "Win rate" },
  { key: "best", label: "Best round", lower: true },
  { key: "worst", label: "Worst round" },
];

function renderStatsView() {
  const host = document.getElementById("view-stats");
  host.replaceChildren();
  if (loadError) { host.append(errorNote(loadError)); return; }

  const games = sessionGames();
  const stats = computeStats(games);
  const rows = sessionPlayers()
    .map((p) => ({ p, s: stats[p.id] }))
    .filter(({ s }) => s && s.rounds > 0)
    .map(({ p, s }) => ({
      p,
      games: s.games.size,
      rounds: s.rounds,
      mean: s.total / s.rounds,
      total: s.total,
      wins: s.wins,
      winrate: (s.wins / s.rounds) * 100,
      best: s.best,
      worst: s.worst,
    }));

  const totalRounds = games.reduce((n, g) => n + g.rounds.length, 0);
  const sessName = activeSession() ? activeSession().name : null;
  host.append(el("div", { class: "title-row" },
    el("div", {}, el("h1", {}, "Stats"),
      el("div", { class: "sub" }, `${games.length} games · ${totalRounds} rounds${sessName ? ` in ${sessName}` : ""}`)),
    rows.length ? el("div", { class: "seg" },
      el("button", { class: `seg-btn${statsView === "cards" ? " active" : ""}`, dataset: { action: "stats-view-cards" } }, "Cards"),
      el("button", { class: `seg-btn${statsView === "table" ? " active" : ""}`, dataset: { action: "stats-view-table" } }, "Table")) : null));

  if (!rows.length) {
    host.append(el("div", { class: "panel" }, el("div", { class: "empty" },
      "No rounds scored yet. Stats appear here after the first round.")));
    return;
  }

  // KPI strip
  const leader = rows.reduce((a, b) => (b.mean < a.mean ? b : a));
  host.append(el("div", { class: "kpis" },
    el("div", { class: "kpi" }, el("div", { class: "kpi-label" }, "Games played"), el("div", { class: "kpi-value num" }, String(games.length))),
    el("div", { class: "kpi" }, el("div", { class: "kpi-label" }, "Rounds scored"), el("div", { class: "kpi-value num" }, String(totalRounds))),
    el("div", { class: "kpi" }, el("div", { class: "kpi-label" }, "Lowest average"),
      el("div", { class: "kpi-value" }, leader.p.name, el("small", {}, fmtMean(leader.total, leader.rounds))))),
  );

  // player cards or sortable table (toggle in the title row); both follow statsSort
  const dir = statsSort.dir;
  const key = statsSort.key;
  rows.sort((a, b) => (a[key] - b[key]) * dir || a.p.name.localeCompare(b.p.name));

  if (statsView === "cards") {
    const grid = el("div", { class: "stats-cards" });
    rows.forEach((r, i) => grid.append(statCard(r, i + 1)));
    host.append(grid);
    const col = STAT_COLS.find((c) => c.key === key);
    host.append(el("div", { class: "table-note", style: "margin-top:10px" },
      `sorted by ${col.label} ${dir === 1 ? "\u25b2" : "\u25bc"} \u00b7 switch to table to change`));
    return;
  }

  const table = el("table", { class: "stats-table" });
  const head = el("tr", {}, el("th", {}, "Player"));
  for (const c of STAT_COLS) {
    head.append(el("th", {
      class: `${c.lower ? "lower num" : ""}${key === c.key ? " active" : ""}`,
      dataset: { action: "stats-sort", key: c.key }, title: c.lower ? "Lower is better" : undefined,
    }, c.label, key === c.key ? el("span", { class: "sort-glyph" }, dir === 1 ? "\u25b2" : "\u25bc") : null));
  }
  table.append(el("thead", {}, head));
  const tbody = el("tbody");
  for (const r of rows) {
    tbody.append(el("tr", {},
      el("td", { class: "name-cell" }, logoChip(), el("span", { class: "p-name" }, r.p.name)),
      el("td", { class: "num" }, String(r.games)),
      el("td", { class: "num" }, String(r.rounds)),
      el("td", { class: "num" }, fmtMean(r.total, r.rounds)),
      el("td", { class: "num" }, String(r.total)),
      el("td", { class: "num" }, String(r.wins)),
      el("td", { class: "num" }, `${Math.round(r.winrate)}%`),
      el("td", { class: "num" }, String(r.best)),
      el("td", { class: "num" }, String(r.worst))));
  }
  table.append(tbody);
  host.append(el("div", { class: "panel", style: "margin-top:var(--gap)" }, table,
    el("div", { class: "table-note" }, "\u2193 lower is better · tap a column to sort")));
}

function fmtMean(total, rounds) {
  return (total / rounds).toFixed(1);
}

// one player's stats as a card (rank = position in the current sort order)
function statCard(r, rank) {
  return el("div", { class: "scard" },
    el("div", { class: "scard-head" },
      logoChip(),
      el("span", { class: "p-name" }, r.p.name),
      el("span", { class: `scard-rank${rank === 1 ? " lead" : ""}` }, "#" + rank)),
    el("div", { class: "scard-main num" }, fmtMean(r.total, r.rounds),
      el("div", { class: "scard-main-label" }, "avg pts \u00b7 lower is better")),
    el("div", { class: "scard-grid" },
      statCell("Games", String(r.games)),
      statCell("Rounds", String(r.rounds)),
      statCell("Wins", String(r.wins)),
      statCell("Win rate", Math.round(r.winrate) + "%")),
    el("div", { class: "scard-foot" }, `best ${r.best} \u00b7 worst ${r.worst}`));
}
function statCell(label, value) {
  return el("div", {}, el("div", { class: "scell-label" }, label), el("div", { class: "scell-value num" }, value));
}

// ---------- players view ----------
let addingPlayer = false;

function renderPlayersView() {
  const host = document.getElementById("view-players");
  host.replaceChildren();
  if (loadError) { host.append(errorNote(loadError)); return; }

  const players = sessionPlayers();
  const stats = computeStats(sessionGames());
  host.append(el("div", { class: "title-row" },
    el("div", {}, el("h1", {}, "Players"),
      el("div", { class: "sub" }, `${players.length} in this session`)),
    addingPlayer ? null : el("button", { class: "btn primary", dataset: { action: "add-player" } }, "Add player")));

  const panel = el("div", { class: "panel" });
  if (!players.length && !addingPlayer) {
    panel.append(el("div", { class: "empty" }, "No players in this session yet — add the first name at the table."));
  } else {
    const list = el("div");

    if (addingPlayer) {
      const row = el("div", { class: "player-row" });
      row.append(el("div", { class: "pavatar" }, "+"));
      const inp = el("input", { class: "rename-input", placeholder: "New player name", maxlength: 30, autocomplete: "off", "aria-label": "New player name" });
      inp.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && inp.value.trim()) {
          try {
            await api("POST", "/api/players", { name: inp.value.trim(), session_id: activeSessionId });
            addingPlayer = false;
            await refresh();
          } catch (err) { alert(err.message); }
        }
        if (e.key === "Escape") { addingPlayer = false; render(); }
      });
      row.append(el("div", {}, inp), el("div", { class: "row-actions" },
        el("button", { class: "icon-btn", dataset: { action: "save-new-player" }, "aria-label": "Add player" }, checkSvg())));
      list.append(row);
    }

    for (const p of players) {
      const s = stats[p.id];
      const row = el("div", { class: "player-row" });
      row.append(el("div", { class: "pavatar" }, initialsOf(p.name)));
      if (renamingPlayerId === p.id) {
        const inp = el("input", { class: "rename-input", value: p.name, maxlength: 30, "aria-label": `Rename ${p.name}` });
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") saveRename(p, inp);
          if (e.key === "Escape") { renamingPlayerId = null; render(); }
        });
        row.append(el("div", {}, inp), el("div", { class: "row-actions" },
          el("button", { class: "icon-btn", dataset: { action: "save-rename-player", id: p.id }, "aria-label": "Save name" }, checkSvg())));
      } else {
        row.append(el("div", {},
          el("div", { style: "font-weight:500" }, p.name),
          el("div", { class: "p-meta" }, s ? `${s.games.size} games · ${s.rounds} rounds` : "hasn't played yet")));
        const hasHistory = !!(s && s.rounds > 0);
        row.append(el("div", { class: "row-actions" },
          iconBtn("rename-player", `Rename ${p.name}`, pencilSvg(), { dataset: { id: p.id } }),
          el("button", {
            class: "icon-btn danger", dataset: { action: "delete-player", id: p.id },
            disabled: hasHistory ? "" : null,
            title: hasHistory ? `${p.name} has round history and can't be deleted` : `Delete ${p.name}`,
          }, trashSvg())));
      }
      list.append(row);
    }
    panel.append(list);
  }
  host.append(panel);

  const focusMe = addingPlayer
    ? document.querySelector(".player-row .rename-input")
    : (renamingPlayerId ? document.querySelector(".rename-input") : null);
  if (focusMe) { focusMe.focus(); focusMe.select(); }
}

async function saveRename(p, inp) {
  const name = inp.value.trim();
  if (!name || name === p.name) { renamingPlayerId = null; render(); return; }
  try {
    await api("PATCH", `/api/players/${p.id}`, { name });
    renamingPlayerId = null;
    await refresh();
  } catch (e) { alert(e.message); }
}

// ---------- shared bits ----------
function errorNote(msg) {
  const note = el("div", { class: "error-note" }, `Couldn't reach the server. ${msg}`);
  note.append(el("button", { class: "btn", style: "margin-left:auto", onclick: () => refresh() }, "Retry"));
  return note;
}

function iconBtn(action, label, svg, extra = {}) {
  const b = el("button", { class: "icon-btn" + (action === "delete-game" || action === "delete-player" ? " danger" : ""), dataset: { action }, title: label, "aria-label": label }, svg);
  if (extra.dataset) Object.assign(b.dataset, extra.dataset);
  return b;
}

function pencilSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("path", { d: "M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" }));
}
function trashSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("path", { d: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0l-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" }));
}
function sunSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("circle", { cx: "12", cy: "12", r: "4" }),
    el("path", { d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" }));
}
function moonSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("path", { d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" }));
}
function userPlusSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("path", { d: "M15 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
    el("circle", { cx: "8", cy: "7", r: "4" }),
    el("path", { d: "M19 8v6M22 11h-6" }));
}
function checkSvg() {
  return el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" },
    el("path", { d: "M5 13l4 4L19 7" }));
}

// ---------- actions ----------
async function act(action, node) {
  const id = node.dataset.id;
  try {
    switch (action) {
      case "new-game": {
        let g = null;
        if (navigator.onLine) {
          try { g = await api("POST", "/api/games", { session_id: activeSessionId }); }
          catch (e) { if (!isNetError(e)) throw e; }
        }
        if (!g) {
          g = { id: newId("g"), name: autoGameName(), created_at: new Date().toISOString(), session_id: activeSessionId, roster: [], rounds: [] };
          state.games.push(g);
          store.markDirty(g);
          localApplied();
        } else await refresh();
        location.hash = `#/game/${g.id}`;
        break;
      }
      case "open-game":
        location.hash = `#/game/${id}`;
        break;
      case "select-session":
        setActiveSession(id);
        if (route.view !== "game") location.hash = "#/game";
        else render();
        break;
      case "new-session":
        addingSession = true;
        render();
        break;
      case "cancel-new-session":
        addingSession = false;
        render();
        break;
      case "delete-session": {
        const s = state.sessions.find((x) => x.id === id);
        if (!s) return;
        const nGames = state.games.filter((g) => g.session_id === id).length;
        const nPlayers = state.players.filter((p) => p.session_id === id).length;
        const ok = await confirmDialog("Delete session?",
          `${s.name} — ${nGames} game${nGames === 1 ? "" : "s"} and ${nPlayers} player${nPlayers === 1 ? "" : "s"} will be permanently removed.`);
        if (!ok) return;
        await api("DELETE", `/api/sessions/${id}`);
        if (activeSessionId === id) { try { localStorage.removeItem(SESSION_KEY); } catch {} }
        await refresh();
        break;
      }
      case "rename-game": {
        const game = gameById(route.gameId);
        if (!game) return;
        const t = document.getElementById("gameTitle");
        if (!t) {
          // already renaming — refocus the open input instead of starting over
          const open = document.querySelector(".title-row .rename-input");
          if (open) open.focus();
          return;
        }
        const inp = el("input", { class: "rename-input", value: game.name, maxlength: 30 });
        t.replaceWith(inp);
        inp.focus(); inp.select();
        inp.addEventListener("keydown", async (e) => {
          if (e.key === "Enter") {
            const name = inp.value.trim();
            let pushed = false;
            if (name && name !== game.name && navigator.onLine && !storeRead().dirty[game.id]) {
              try { await api("PATCH", `/api/games/${game.id}`, { name }); pushed = true; }
              catch (err) { if (!isNetError(err)) { alert(err.message); return; } }
            }
            if (name && name !== game.name && !pushed) { game.name = name; store.markDirty(game); }
            if (pushed) await refresh(); else localApplied();
          }
          if (e.key === "Escape") await refresh();
        });
        break;
      }
      case "delete-game": {
        const game = gameById(route.gameId);
        if (!game) return;
        const ok = await confirmDialog("Delete game?", `${game.name} — ${game.rounds.length} rounds will be removed from the stats.`);
        if (!ok) return;
        let pushed = false;
        if (navigator.onLine && !storeRead().dirty[game.id]) {
          try { await api("DELETE", `/api/games/${game.id}`); pushed = true; }
          catch (e) { if (!isNetError(e)) throw e; }
        }
        state.games = state.games.filter((g) => g.id !== game.id);
        store.deleteGame(game.id);
        location.hash = "#/game";
        if (pushed) await refresh(); else localApplied();
        break;
      }
      case "toggle-player-menu": {
        closePlayerMenu();
        const game = gameById(route.gameId);
        if (!game) return;
        const menu = el("div", { class: "player-menu" });
        fillPlayerMenu(menu);
        document.body.append(menu);
        // float near the tapped control, clamped to the viewport; fixed positioning
        // works from any anchor (the empty-state button has no positioned parent)
        const br = node.getBoundingClientRect();
        const mw = menu.offsetWidth || 240;
        const mh = menu.offsetHeight;
        let left = Math.min(Math.max(8, br.left), Math.max(8, innerWidth - mw - 8));
        let top = br.bottom + 6;
        if (top + mh > innerHeight - 8) top = Math.max(8, br.top - 6 - mh); // flip above
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        const onDoc = (e) => { if (!menu.contains(e.target)) closePlayerMenu(); };
        const onKey = (e) => { if (e.key === "Escape") closePlayerMenu(); };
        playerMenuCleanup = () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); };
        setTimeout(() => { document.addEventListener("click", onDoc); document.addEventListener("keydown", onKey); }, 0);
        break;
      }
      case "pick-player": {
        const game = gameById(route.gameId);
        if (!game) return;
        let pushed = false;
        if (navigator.onLine && !storeRead().dirty[game.id]) {
          try { await api("PATCH", `/api/games/${game.id}`, { roster: [...game.roster, id] }); pushed = true; }
          catch (e) { if (!isNetError(e)) throw e; }
        }
        if (!pushed && !game.roster.includes(id)) game.roster.push(id);
        closePlayerMenu();
        if (pushed) await refresh(); else { store.markDirty(game); localApplied(); }
        break;
      }
      case "menu-new-player": {
        const game = gameById(route.gameId);
        if (!game) return;
        const menu = node.closest(".player-menu");
        const field = el("div", { style: "padding:6px 10px;border-top:1px solid var(--border)" });
        const inp = el("input", { class: "rename-input", style: "width:100%", placeholder: "New player name", maxlength: 30, autocomplete: "off" });
        field.append(inp);
        menu.append(field);
        inp.focus();
        inp.addEventListener("keydown", async (e) => {
          if (e.key === "Enter" && inp.value.trim()) {
            try {
              let p = null;
              if (navigator.onLine) {
                try { p = await api("POST", "/api/players", { name: inp.value.trim(), session_id: activeSessionId }); }
                catch (err) { if (!isNetError(err)) throw err; }
              }
              if (!p) { p = { id: newId("p"), name: inp.value.trim(), session_id: activeSessionId }; state.players.push(p); store.addPlayer(p); }
              let pushed = false;
              if (navigator.onLine && !storeRead().dirty[game.id]) {
                try { await api("PATCH", `/api/games/${game.id}`, { roster: [...game.roster, p.id] }); pushed = true; }
                catch (err) { if (!isNetError(err)) throw err; }
              }
              if (!pushed && !game.roster.includes(p.id)) game.roster.push(p.id);
              closePlayerMenu();
              if (pushed) await refresh(); else { store.markDirty(game); localApplied(); }
            } catch (err) { alert(err.message); }
          }
          if (e.key === "Escape") closePlayerMenu();
        });
        break;
      }
      case "remove-from-roster": {
        const game = gameById(node.dataset.game || route.gameId);
        if (!game) return;
        let pushed = false;
        if (navigator.onLine && !storeRead().dirty[game.id]) {
          try { await api("PATCH", `/api/games/${game.id}`, { roster: game.roster.filter((x) => x !== id) }); pushed = true; }
          catch (e) { if (!isNetError(e)) throw e; }
        }
        if (!pushed) game.roster = game.roster.filter((x) => x !== id);
        if (pushed) await refresh(); else { store.markDirty(game); localApplied(); }
        break;
      }
      case "cancel-add": {
        // the entry row is permanent — Cancel just clears it
        document.querySelectorAll(".entry-row .score-input").forEach((i) => (i.value = ""));
        const first = document.querySelector(".entry-row .score-input");
        if (first) first.focus();
        break;
      }
      case "edit-round":
        editingRoundId = id;
        render();
        break;
      case "cancel-edit":
        editingRoundId = null;
        render();
        break;
      case "delete-round": {
        const ok = await confirmDialog("Delete round?", `Round ${editingRoundIndex(id) + 1} will be removed and the stats recomputed.`);
        if (!ok) return;
        const game = gameById(route.gameId);
        let pushed = false;
        if (navigator.onLine && !storeRead().dirty[game.id]) {
          try { await api("DELETE", `/api/games/${route.gameId}/rounds/${id}`); pushed = true; }
          catch (e) { if (!isNetError(e)) throw e; }
        }
        editingRoundId = null;
        if (!pushed) game.rounds = game.rounds.filter((r) => r.id !== id);
        if (pushed) await refresh(); else { store.markDirty(game); localApplied(); }
        break;
      }
      case "add-round":
      case "save-round": {
        let scores, invalid;
        try { ({ scores, invalid } = readEntryRow()); }
        catch (e) { showEntryError(e.message); return; }
        if (invalid) { showEntryError(invalid); return; }
        const game = gameById(route.gameId);
        let pushed = false;
        if (navigator.onLine && !storeRead().dirty[game.id]) {
          try {
            if (action === "add-round") await api("POST", `/api/games/${game.id}/rounds`, { scores });
            else await api("PATCH", `/api/games/${game.id}/rounds/${editingRoundId}`, { scores });
            pushed = true;
          } catch (e) { if (!isNetError(e)) { showEntryError(e.message); return; } }
        }
        if (!pushed) {
          if (action === "add-round") game.rounds.push({ id: newId("r"), scores });
          else { const r = game.rounds.find((x) => x.id === editingRoundId); if (r) r.scores = scores; }
          store.markDirty(game);
        }
        editingRoundId = null;
        if (action === "add-round") {
          // focus the entry row so the next round can be scored immediately
          pendingFocusFirstInput = true;
        }
        if (pushed) await refresh(); else localApplied();
        break;
      }
      case "rename-player":
        renamingPlayerId = id;
        render();
        break;
      case "save-rename-player": {
        const p = playerById(id);
        const inp = document.querySelector(".rename-input");
        if (p && inp) await saveRename(p, inp);
        break;
      }
      case "delete-player": {
        const p = playerById(id);
        if (!p) return;
        const ok = await confirmDialog("Delete player?", `${p.name} hasn't played any rounds and will be removed from the registry.`);
        if (!ok) return;
        await api("DELETE", `/api/players/${id}`);
        await refresh();
        break;
      }
      case "add-player":
        addingPlayer = true;
        renamingPlayerId = null;
        render();
        break;
      case "save-new-player": {
        const inp = document.querySelector(".player-row .rename-input");
        if (inp && inp.value.trim()) {
          let pushed = false;
          if (navigator.onLine) {
            try { await api("POST", "/api/players", { name: inp.value.trim(), session_id: activeSessionId }); pushed = true; }
            catch (e) { if (!isNetError(e)) throw e; }
          }
          if (!pushed) { const p = { id: newId("p"), name: inp.value.trim(), session_id: activeSessionId }; state.players.push(p); store.addPlayer(p); }
          addingPlayer = false;
          if (pushed) await refresh(); else localApplied();
        }
        break;
      }
      case "toggle-theme":
        toggleTheme();
        break;
      case "stats-sort": {
        const key = node.dataset.key;
        if (statsSort.key === key) statsSort.dir *= -1;
        else statsSort = { key, dir: 1 };
        render();
        break;
      }
      case "stats-view-cards":
      case "stats-view-table": {
        statsView = action === "stats-view-cards" ? "cards" : "table";
        try { localStorage.setItem(STATS_VIEW_KEY, statsView); } catch (e) {}
        render();
        break;
      }
    }
  } catch (e) {
    alert(isNetError(e) ? "You're offline — that action needs a connection." : e.message);
  }
}

function editingRoundIndex(rid) {
  const game = gameById(route.gameId);
  return game ? game.rounds.findIndex((r) => r.id === rid) : -1;
}

let playerMenuCleanup = null;

// (re)build the candidate list inside a roster menu, keeping position + listeners
function fillPlayerMenu(menu) {
  const game = gameById(route.gameId);
  if (!game) return;
  menu.replaceChildren();
  const candidates = sessionPlayers().filter((p) => !game.roster.includes(p.id));
  for (const p of candidates) {
    menu.append(el("button", { class: "menu-item", dataset: { action: "pick-player", id: p.id } },
      logoChip(), p.name));
  }
  menu.append(el("button", { class: "menu-item menu-new", dataset: { action: "menu-new-player" } }, "+ Add new player"));
}

function closePlayerMenu() {
  document.querySelectorAll(".player-menu").forEach((m) => m.remove());
  // also drop the document-level outside-click/Escape listeners, otherwise a
  // stale listener kills the next menu that opens on the very same tap
  if (playerMenuCleanup) { const c = playerMenuCleanup; playerMenuCleanup = null; c(); }
}

function readEntryRow() {
  const cells = [...document.querySelectorAll(".entry-row .score-input")];
  const scores = {};
  let filled = 0;
  for (const inp of cells) {
    const v = inp.value.trim();
    if (v === "" || v === "\u2013" || v === "-") continue; // absent: blank or dash
    if (!/^-?\d+$/.test(v)) return { scores, invalid: "Scores must be whole numbers. Use \u2013 for a player who wasn't in the round." };
    scores[inp.dataset.pid] = parseInt(v, 10);
    filled += 1;
  }
  if (filled < 2) return { scores, invalid: "Enter scores for at least two players." };
  return { scores, invalid: null };
}

function showEntryError(msg) {
  let note = document.querySelector(".entry-note");
  if (!note) {
    note = el("div", { class: "entry-note" });
    const actions = document.querySelector(".entry-actions");
    if (actions) actions.parentElement.append(note);
  }
  note.replaceChildren(el("div", { class: "error-note" }, msg));
}

// ---------- render + events ----------
function renderFooter() {
  const f = document.getElementById("canvasFooter");
  if (!f) return;
  const gs = sessionGames();
  const totalRounds = gs.reduce((n, g) => n + g.rounds.length, 0);
  f.replaceChildren(document.createTextNode(`${gs.length} games \u00b7 ${totalRounds} rounds`));
}

function render() {
  renderChrome();
  renderFooter();
  if (route.view === "game") renderGameView();
  else if (route.view === "stats") renderStatsView();
  else if (route.view === "sessions") renderSessionsView();
  else renderPlayersView();
  updateSyncIcon();

  if (pendingFocusFirstInput) {
    pendingFocusFirstInput = false;
    const first = document.querySelector(".entry-row .score-input");
    if (first) first.focus({ preventScroll: true });
  }
}

document.addEventListener("click", (e) => {
  const node = e.target.closest("[data-action]");
  if (!node || node.disabled) return;
  act(node.dataset.action, node);
});

// Enter in a score input submits the row
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("score-input")) {
    e.preventDefault();
    const editing = editingRoundId !== null;
    act(editing ? "save-round" : "add-round", { dataset: {} });
  }
});

window.addEventListener("hashchange", () => {
  route = parseHash();
  editingRoundId = null;
  renamingPlayerId = null;
  render();
});

(async () => {
  await refresh();
  syncNow(); // flush anything left over from a previous session
})();

// ---------- offline reconnect ----------
window.addEventListener("online", () => { refresh().then(() => syncNow()); });
window.addEventListener("offline", updateSyncIcon);
setInterval(() => { if (navigator.onLine && store.pendingCount()) syncNow(); }, 30000);

// ---------- PWA service worker + auto-update check on load ----------
if ("serviceWorker" in navigator) {
  let swReg = null;
  const SW_RELOAD_KEY = "cambio-sw-reloaded";
  // Pick up a new version by reloading once (debounced so it can never loop).
  const maybeReloadForUpdate = () => {
    if (!navigator.serviceWorker.controller) return; // first install: this page is already fresh
    const last = Number(sessionStorage.getItem(SW_RELOAD_KEY) || 0);
    if (Date.now() - last < 60000) return;
    sessionStorage.setItem(SW_RELOAD_KEY, String(Date.now()));
    location.reload();
  };
  const watchInstall = (worker) => {
    if (!worker) return;
    // Reload only AFTER the new worker has had a beat to activate + claim
    // (skipWaiting). Reloading at the exact "installed" moment races the
    // activation in Chromium and strands the new worker in "waiting".
    const onInstalled = () => setTimeout(maybeReloadForUpdate, 1200);
    if (worker.state === "installed") onInstalled();
    else worker.addEventListener("statechange", () => { if (worker.state === "installed") onInstalled(); }, { once: true });
  };
  // Explicit check on every load — without it Chrome only re-checks ~24h apart.
  const checkForUpdates = () => {
    if (!swReg) return;
    if (swReg.waiting) watchInstall(swReg.waiting); // update arrived while the app was closed
    else swReg.update().then(() => watchInstall(swReg.installing)).catch(() => {});
  };
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => { swReg = reg; checkForUpdates(); }).catch(() => {});
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkForUpdates(); });
}
syncThemeColor();
