# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~15,551 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 154 nodes · 345 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f3e9f22`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- ts-cambio
- render
- create_game
- save
- manifest.json
- sync
- create_player
- toggleTheme
- sw.js
- storeRead
- act

## God Nodes (most connected - your core abstractions)
1. `el()` - 22 edges
2. `act()` - 20 edges
3. `renderGame()` - 14 edges
4. `load()` - 14 edges
5. `save()` - 14 edges
6. `renderPlayersView()` - 13 edges
7. `render()` - 12 edges
8. `sync()` - 11 edges
9. `refresh()` - 10 edges
10. `create_game()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `renderGame()` --indirect_call--> `playerById()`  [INFERRED]
  static/app.js → static/app.js  _Bridges community 14 → community 1_
- `RoundIn` --inherits--> `BaseModel`  [EXTRACTED]
  app.py →   _Bridges community 8 → community 5_
- `GamePatch` --inherits--> `BaseModel`  [EXTRACTED]
  app.py →   _Bridges community 6 → community 5_
- `PlayerIn` --inherits--> `BaseModel`  [EXTRACTED]
  app.py →   _Bridges community 9 → community 5_
- `act()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 14 → community 4_

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.18
Nodes (11): fmtDate(), moonSvg(), renderChrome(), route, STAT_COLS, state, statsSort, statsView (+3 more)

### Community 1 - "el"
Cohesion: 0.20
Nodes (22): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fmtMean(), gameRow(), iconBtn() (+14 more)

### Community 2 - "app.py"
Cohesion: 0.13
Nodes (6): _asset_version(), backup(), get_state(), index(), service_worker(), _startup()

### Community 3 - "ts-cambio"
Cohesion: 0.12
Nodes (16): build, container_name, environment, ports, restart, volumes, services, cambio (+8 more)

### Community 4 - "render"
Cohesion: 0.36
Nodes (10): api(), isNetError(), localApplied(), refresh(), render(), renderFooter(), saveRename(), syncNow() (+2 more)

### Community 5 - "create_game"
Cohesion: 0.29
Nodes (6): _auto_game_name(), create_game(), GameIn, SyncGameIn, SyncPlayerIn, SyncRoundIn

### Community 6 - "save"
Cohesion: 0.22
Nodes (11): _default(), delete_game(), delete_player(), delete_round(), _find_game(), _find_player(), GamePatch, load() (+3 more)

### Community 7 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 8 - "sync"
Cohesion: 0.24
Nodes (7): add_round(), edit_round(), _new_id(), RoundIn, sync(), SyncIn, _valid_scores()

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "toggleTheme"
Cohesion: 0.67
Nodes (4): applyTheme(), currentTheme(), syncThemeColor(), toggleTheme()

### Community 12 - "storeRead"
Cohesion: 0.67
Nodes (3): cachedState(), storeBlank(), storeRead()

### Community 14 - "act"
Cohesion: 0.22
Nodes (11): act(), autoGameName(), closePlayerMenu(), confirmDialog(), editingRoundIndex(), fillPlayerMenu(), gameById(), newId() (+3 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `act`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Why does `sync()` connect `sync` to `create_player`, `app.py`, `save`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `ts-cambio` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._