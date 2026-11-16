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

The repo ships `docker-compose.example.yml` (not a live `docker-compose.yml`, so
git pulls can never clobber your local one). Copy it, then pick an option:

### Option A — LAN only

```bash
cd cambio-scorekeeper
cp docker-compose.example.yml docker-compose.yml
# delete the whole "ts-cambio:" service block from docker-compose.yml
docker compose up -d --build
# open http://<server-ip>:3087 from the phone
```

No auth by design: intended for a trusted LAN only. Don't expose the port to
the internet.

### Option B — Tailscale Funnel (reachable from anywhere)

Runs the app plus a `tailscale/tailscale` sidecar that joins your tailnet and
funnels port 8000 to a public `https://cambio.<your-tailnet>.ts.net` URL.

```bash
cd cambio-scorekeeper
cp docker-compose.example.yml docker-compose.yml
cp .env.example .env
# edit .env: paste your Tailscale auth key
#   (https://login.tailscale.com/admin/settings/security/auth-keys —
#    a "reusability: once" key is fine)
docker compose up -d --build
```

- The tailnet machine appears as `cambio`; the funnel URL is shown by
  `docker logs ts-cambio` (or in the Tailscale admin UI under Funnel).
- State: app data in `./data/`, tailscale machine state in `./ts-state-cambio/`.
  Back up `./data/` — the app also keeps rotating `.bak` copies of `data.json`
  (last 14) after each write.
- **Funnel is public**: anyone with the ts.net URL can play, and the app has no
  auth by design. Keep the URL private; disable it anytime with
  `docker exec ts-cambio tailscale funnel --bg --unset 8000`.

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
