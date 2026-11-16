# Cambio scorekeeper

Dark, phone-first web app for scoring **Cambio (Cabo)** card games across multiple
nights. One phone at the table; all data is stored server-side on your machine.

## What it does

- **Game** — continue last night's game or start a new one. Roster via dropdown of
  every player that has ever existed (+ add new). One row per round: type points
  per player, `–` or blank = not in the round. Tap any saved row to correct or
  delete it. Lowest score wins (ties share); winners are highlighted.
- **Stats** — across all games: games played, rounds, average points, total points,
  wins, win rate, best and worst round. Sortable columns, lower-is-better marked.
- **Players** — global registry. Rename freely (history follows the player).
  Delete is blocked once a player has any round history.

## Run locally (dev)

```bash
python3 -m uvicorn app:app --host 127.0.0.1 --port 8377
# open http://127.0.0.1:8377
```

Data lands in `./data/data.json` (override with `CAMBIO_DATA=/path`).

## Deploy on Proxmox (Docker)

```bash
cd cambio-scorekeeper
docker compose up -d --build
# open http://<server-ip>:8377 from the phone
```

- All state is in `./data/` — back up that one folder. The app also keeps
  rotating `.bak` copies of `data.json` (last 14) after each write.
- No auth by design: intended for a trusted LAN only. Don't expose the port
  to the internet.

## Data model (`data/data.json`)

```jsonc
{
  "players": [{ "id": "p…", "name": "Johan" }],
  "games": [{
    "id": "g…", "name": "Cabo — Sat 14 Nov", "created_at": "…",
    "roster": ["p…"],
    "rounds": [{ "id": "r…", "scores": { "p…": 3 } }]  // missing key = absent
  }]
}
```

Writes are atomic (tmp file + rename) and serialized with a lock.
