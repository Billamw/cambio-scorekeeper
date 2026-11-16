#!/usr/bin/env python3
"""Cambio scorekeeper — FastAPI + single JSON file storage.

Data model (data.json):
  players: [{id, name}]                      # global registry, display order
  games:   [{id, name, created_at, roster: [player_id], rounds: [{id, scores: {player_id: int}}]}]

A round cell is a player_id -> integer score. Absent players are simply missing keys.
Single writer (one phone on the LAN); every mutation is an atomic rewrite (tmp + rename).
"""

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
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

DATA_DIR = Path(os.environ.get("CAMBIO_DATA", str(Path(__file__).parent / "data")))
DATA_FILE = DATA_DIR / "data.json"
LOCK = threading.Lock()
MAX_BAKS = 14


# ---------- storage ----------

def _default() -> dict:
    return {"players": [], "games": []}


def load() -> dict:
    if not DATA_FILE.exists():
        return _default()
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("players", [])
    data.setdefault("games", [])
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


class GameIn(BaseModel):
    name: Optional[str] = None
    player_ids: list[str] = []


class GamePatch(BaseModel):
    name: Optional[str] = None
    roster: Optional[list[str]] = None


class RoundIn(BaseModel):
    scores: dict[str, int]


# ---------- app ----------

app = FastAPI(title="Cambio scorekeeper")


@app.on_event("startup")
def _startup() -> None:
    backup()


@app.get("/api/state")
def get_state():
    with LOCK:
        return load()


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
        roster = []
        for pid in body.player_ids:
            _find_player(data, pid)
            if pid not in roster:
                roster.append(pid)
        g = {
            "id": _new_id("g"),
            "name": name,
            "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
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


# static frontend -----------------------------------------------------------

STATIC_DIR = Path(__file__).parent / "static"


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", __import__("fastapi.staticfiles", fromlist=["StaticFiles"]).StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/icons", __import__("fastapi.staticfiles", fromlist=["StaticFiles"]).StaticFiles(directory=Path(__file__).parent / "icons"), name="icons")
