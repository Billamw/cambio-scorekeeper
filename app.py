#!/usr/bin/env python3
"""Cambio scorekeeper — FastAPI + single JSON file storage.

Data model (data.json):
  sessions: [{id, name}]                     # group of game nights (e.g. a trip)
  players: [{id, name}]                      # global registry, display order
  games:   [{id, name, created_at, session_id, roster: [player_id], rounds: [{id, scores: {player_id: int}}]}]

A round cell is a player_id -> integer score. Absent players are simply missing keys.
Single writer (one phone on the LAN); every mutation is an atomic rewrite (tmp + rename).
"""

import hashlib
import json
import os
import re
import shutil
import tempfile
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

DATA_DIR = Path(os.environ.get("CAMBIO_DATA", str(Path(__file__).parent / "data")))
DATA_FILE = DATA_DIR / "data.json"
LOCK = threading.Lock()
MAX_BAKS = 14


# ---------- storage ----------

def _default() -> dict:
    return {
        "players": [],
        "games": [],
        "sessions": [{"id": "s-erasmus-madrid", "name": "Erasmus Madrid"}],
    }


def load() -> dict:
    if not DATA_FILE.exists():
        return _default()
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("players", [])
    data.setdefault("games", [])
    data.setdefault("sessions", [])
    if not data["sessions"]:
        # first run of an existing dataset: seed the default session and attach
        # every pre-existing game to it
        data["sessions"].append({"id": "s-erasmus-madrid", "name": "Erasmus Madrid"})
        for g in data["games"]:
            g.setdefault("session_id", "s-erasmus-madrid")
        save(data)
    return data


def save(data: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=DATA_DIR, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp, DATA_FILE)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


def backup() -> None:
    """Snapshot data.json on startup; keep the newest MAX_BAKS."""
    if not DATA_FILE.exists():
        return
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    shutil.copy2(DATA_FILE, DATA_DIR / f"data-{stamp}.bak")
    baks = sorted(DATA_DIR.glob("data-*.bak"))
    for old in baks[:-MAX_BAKS]:
        old.unlink(missing_ok=True)


# ---------- helpers ----------

def _new_id(prefix: str) -> str:
    return prefix + uuid.uuid4().hex[:10]


def _find_player(data: dict, pid: str) -> dict:
    for p in data["players"]:
        if p["id"] == pid:
            return p
    raise HTTPException(404, "player not found")


def _find_game(data: dict, gid: str) -> dict:
    for g in data["games"]:
        if g["id"] == gid:
            return g
    raise HTTPException(404, "game not found")


def _name_taken(data: dict, name: str, ignore_id: Optional[str] = None) -> bool:
    needle = name.strip().casefold()
    return any(
        p["id"] != ignore_id and p["name"].strip().casefold() == needle
        for p in data["players"]
    )


def _player_has_round_history(data: dict, pid: str) -> bool:
    return any(pid in r["scores"] for g in data["games"] for r in g["rounds"])


def _clean_name(raw: str) -> str:
    name = re.sub(r"\s+", " ", raw.strip())
    if not name:
        raise HTTPException(400, "name must not be empty")
    if len(name) > 30:
        raise HTTPException(400, "name too long (max 30)")
    return name


def _auto_game_name() -> str:
    now = datetime.now()
    base = now.strftime("%a %d %b")
    if now.year != datetime.now(timezone.utc).year:
        base += f" {now.year}"
    return base


def _valid_scores(data: dict, game: dict, scores: dict) -> None:
    if not isinstance(scores, dict) or not scores:
        raise HTTPException(400, "scores must be a non-empty object")
    roster = set(game["roster"])
    for pid, val in scores.items():
        if pid not in roster:
            raise HTTPException(400, f"player {pid} is not in this game's roster")
        if not isinstance(val, int) or isinstance(val, bool):
            raise HTTPException(400, f"score for {pid} must be an integer")
    if len(scores) < 2:
        raise HTTPException(400, "a round needs at least two present players")


# ---------- models ----------

class PlayerIn(BaseModel):
    name: str = Field(min_length=1, max_length=30)


class SessionIn(BaseModel):
    name: str = Field(min_length=1, max_length=30)


class GameIn(BaseModel):
    name: Optional[str] = None
    player_ids: list[str] = []
    session_id: Optional[str] = None


class GamePatch(BaseModel):
    name: Optional[str] = None
    roster: Optional[list[str]] = None


class RoundIn(BaseModel):
    scores: dict[str, int]


class SyncPlayerIn(BaseModel):
    id: str
    name: str


class SyncRoundIn(BaseModel):
    id: Optional[str] = None
    scores: dict[str, int]


class SyncGameIn(BaseModel):
    id: str
    name: str
    created_at: Optional[str] = None
    session_id: Optional[str] = None
    roster: list[str] = []
    rounds: list[SyncRoundIn] = []


class SyncIn(BaseModel):
    players: list[SyncPlayerIn] = []
    games: list[SyncGameIn] = []


# ---------- app ----------

app = FastAPI(title="Cambio scorekeeper")


@app.on_event("startup")
def _startup() -> None:
    backup()


@app.get("/api/state")
def get_state():
    with LOCK:
        return load()


# sessions ----------------------------------------------------------------

@app.post("/api/sessions", status_code=201)
def create_session(body: SessionIn):
    name = _clean_name(body.name)
    with LOCK:
        data = load()
        if any(s["name"].strip().casefold() == name.strip().casefold() for s in data["sessions"]):
            raise HTTPException(409, "a session with this name already exists")
        s = {"id": _new_id("s"), "name": name}
        data["sessions"].append(s)
        save(data)
        return s


# players -----------------------------------------------------------------

@app.post("/api/players", status_code=201)
def create_player(body: PlayerIn):
    name = _clean_name(body.name)
    with LOCK:
        data = load()
        if _name_taken(data, name):
            raise HTTPException(409, "a player with this name already exists")
        p = {"id": _new_id("p"), "name": name}
        data["players"].append(p)
        save(data)
        return p


@app.patch("/api/players/{pid}")
def rename_player(pid: str, body: PlayerIn):
    name = _clean_name(body.name)
    with LOCK:
        data = load()
        p = _find_player(data, pid)
        if _name_taken(data, name, ignore_id=pid):
            raise HTTPException(409, "a player with this name already exists")
        p["name"] = name
        save(data)
        return p


@app.delete("/api/players/{pid}")
def delete_player(pid: str):
    with LOCK:
        data = load()
        _find_player(data, pid)
        if _player_has_round_history(data, pid):
            raise HTTPException(409, "player has round history and cannot be deleted")
        data["players"] = [p for p in data["players"] if p["id"] != pid]
        for g in data["games"]:
            g["roster"] = [x for x in g["roster"] if x != pid]
        save(data)
        return {"ok": True}


# games -------------------------------------------------------------------

@app.post("/api/games", status_code=201)
def create_game(body: GameIn):
    with LOCK:
        data = load()
        name = _clean_name(body.name) if body.name else _auto_game_name()
        sid = body.session_id or data["sessions"][0]["id"]
        if not any(s["id"] == sid for s in data["sessions"]):
            raise HTTPException(404, "session not found")
        roster = []
        for pid in body.player_ids:
            _find_player(data, pid)
            if pid not in roster:
                roster.append(pid)
        g = {
            "id": _new_id("g"),
            "name": name,
            "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "session_id": sid,
            "roster": roster,
            "rounds": [],
        }
        data["games"].append(g)
        save(data)
        return g


@app.patch("/api/games/{gid}")
def patch_game(gid: str, body: GamePatch):
    with LOCK:
        data = load()
        g = _find_game(data, gid)
        if body.name is not None:
            g["name"] = _clean_name(body.name)
        if body.roster is not None:
            roster = []
            for pid in body.roster:
                _find_player(data, pid)
                if pid not in roster:
                    roster.append(pid)
            g["roster"] = roster
        save(data)
        return g


@app.delete("/api/games/{gid}")
def delete_game(gid: str):
    with LOCK:
        data = load()
        _find_game(data, gid)
        data["games"] = [g for g in data["games"] if g["id"] != gid]
        save(data)
        return {"ok": True}


# rounds ------------------------------------------------------------------

@app.post("/api/games/{gid}/rounds", status_code=201)
def add_round(gid: str, body: RoundIn):
    with LOCK:
        data = load()
        g = _find_game(data, gid)
        _valid_scores(data, g, body.scores)
        r = {"id": _new_id("r"), "scores": dict(body.scores)}
        g["rounds"].append(r)
        save(data)
        return r


@app.patch("/api/games/{gid}/rounds/{rid}")
def edit_round(gid: str, rid: str, body: RoundIn):
    with LOCK:
        data = load()
        g = _find_game(data, gid)
        r = next((x for x in g["rounds"] if x["id"] == rid), None)
        if r is None:
            raise HTTPException(404, "round not found")
        _valid_scores(data, g, body.scores)
        r["scores"] = dict(body.scores)
        save(data)
        return r


@app.delete("/api/games/{gid}/rounds/{rid}")
def delete_round(gid: str, rid: str):
    with LOCK:
        data = load()
        g = _find_game(data, gid)
        before = len(g["rounds"])
        g["rounds"] = [x for x in g["rounds"] if x["id"] != rid]
        if len(g["rounds"]) == before:
            raise HTTPException(404, "round not found")
        save(data)
        return {"ok": True}


@app.post("/api/sync")
def sync(body: SyncIn):
    """Upload an offline queue: upsert whole games by id.

    Single-writer app (one phone at the table), so a full-state replace of a
    dirty game is safe; client-generated ids are accepted for players, games
    and rounds created while offline.
    """
    with LOCK:
        data = load()
        for p in body.players:
            if any(x["id"] == p.id for x in data["players"]):
                continue
            name = _clean_name(p.name)
            if _name_taken(data, name):
                raise HTTPException(409, f"player name '{name}' is already taken")
            data["players"].append({"id": p.id, "name": name})
        synced = []
        for g in body.games:
            roster = []
            for pid in g.roster:
                _find_player(data, pid)
                if pid not in roster:
                    roster.append(pid)
            rounds = []
            for r in g.rounds:
                _valid_scores(data, {"roster": roster}, r.scores)
                rounds.append({"id": r.id or _new_id("r"), "scores": dict(r.scores)})
            existing = next((x for x in data["games"] if x["id"] == g.id), None)
            if existing:
                existing["name"] = _clean_name(g.name)
                existing["roster"] = roster
                existing["rounds"] = rounds
                synced.append(existing["id"])
            else:
                valid_sid = next((s["id"] for s in data["sessions"] if s["id"] == g.session_id), None)
                data["games"].append({
                    "id": g.id,
                    "name": _clean_name(g.name),
                    "created_at": g.created_at
                    or datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    "session_id": valid_sid or data["sessions"][0]["id"],
                    "roster": roster,
                    "rounds": rounds,
                })
                synced.append(g.id)
        save(data)
        return {"synced": synced}


# static frontend -----------------------------------------------------------

STATIC_DIR = Path(__file__).parent / "static"


def _asset_version() -> str:
    h = hashlib.sha256()
    for name in ("app.js", "style.css"):
        h.update((STATIC_DIR / name).read_bytes())
    return h.hexdigest()[:10]


@app.get("/")
def index():
    # version-bust asset URLs so clients never keep stale CSS/JS after a deploy
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(html.replace("{{ASSET_VERSION}}", _asset_version()))


app.mount("/static", __import__("fastapi.staticfiles", fromlist=["StaticFiles"]).StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/icons", __import__("fastapi.staticfiles", fromlist=["StaticFiles"]).StaticFiles(directory=Path(__file__).parent / "icons"), name="icons")


@app.get("/sw.js")
def service_worker():
    # served from the root so its default scope covers the whole app
    return FileResponse(STATIC_DIR / "sw.js", headers={"Service-Worker-Allowed": "/"})
