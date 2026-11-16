# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~16,002 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 160 nodes · 369 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2071315d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- ts-cambio
- render
- sync
- save
- manifest.json
- add_round
- create_player
- toggleTheme
- sw.js
- renderHome
- act

## God Nodes (most connected - your core abstractions)
1. `el()` - 23 edges
2. `act()` - 21 edges
3. `load()` - 16 edges
4. `save()` - 16 edges
5. `renderGame()` - 14 edges
6. `renderPlayersView()` - 13 edges
7. `render()` - 13 edges
8. `refresh()` - 12 edges
9. `sync()` - 11 edges
10. `create_game()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `add_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 8_
- `create_game()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 5_
- `create_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 9_
- `get_state()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 2_
- `add_round()` --calls--> `_new_id()`  [EXTRACTED]
  app.py → app.py  _Bridges community 5 → community 8_

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.18
Nodes (10): cachedState(), route, STAT_COLS, state, statsSort, statsView, store, storeBlank() (+2 more)

### Community 1 - "el"
Cohesion: 0.19
Nodes (23): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fmtDate(), fmtMean(), iconBtn() (+15 more)

### Community 2 - "app.py"
Cohesion: 0.13
Nodes (6): _asset_version(), backup(), get_state(), index(), service_worker(), _startup()

### Community 3 - "ts-cambio"
Cohesion: 0.12
Nodes (16): build, container_name, environment, ports, restart, volumes, services, cambio (+8 more)

### Community 4 - "render"
Cohesion: 0.30
Nodes (12): api(), isNetError(), localApplied(), refresh(), render(), renderFooter(), resolveActiveSession(), saveRename() (+4 more)

### Community 5 - "sync"
Cohesion: 0.17
Nodes (11): _auto_game_name(), create_game(), create_session(), GameIn, _new_id(), SessionIn, sync(), SyncGameIn (+3 more)

### Community 6 - "save"
Cohesion: 0.23
Nodes (11): _default(), delete_game(), delete_player(), delete_round(), _find_game(), _find_player(), GamePatch, load() (+3 more)

### Community 7 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 8 - "add_round"
Cohesion: 0.50
Nodes (4): add_round(), edit_round(), RoundIn, _valid_scores()

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "toggleTheme"
Cohesion: 0.67
Nodes (4): applyTheme(), currentTheme(), syncThemeColor(), toggleTheme()

### Community 12 - "renderHome"
Cohesion: 0.50
Nodes (5): gameRow(), latestGame(), renderGameView(), renderHome(), sessionGames()

### Community 14 - "act"
Cohesion: 0.22
Nodes (11): act(), autoGameName(), closePlayerMenu(), confirmDialog(), editingRoundIndex(), fillPlayerMenu(), gameById(), newId() (+3 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderHome`, `render`, `act`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Why does `act()` connect `act` to `app.js`, `el`, `toggleTheme`, `render`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `ts-cambio` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._