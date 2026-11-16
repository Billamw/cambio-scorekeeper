# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~13,690 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 126 nodes · 284 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4df0cb4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- cambio
- edit_round
- act
- save
- manifest.json
- create_game
- create_player
- renderChrome
- sw.js
- backup

## God Nodes (most connected - your core abstractions)
1. `el()` - 22 edges
2. `act()` - 15 edges
3. `renderGame()` - 14 edges
4. `renderPlayersView()` - 14 edges
5. `load()` - 13 edges
6. `save()` - 13 edges
7. `render()` - 10 edges
8. `create_game()` - 9 edges
9. `create_player()` - 8 edges
10. `rename_player()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `add_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 8_
- `create_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 9_
- `edit_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 4_
- `get_state()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 2_
- `create_player()` --calls--> `_new_id()`  [EXTRACTED]
  app.py → app.py  _Bridges community 8 → community 9_

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.17
Nodes (14): applyTheme(), currentTheme(), gameRow(), latestGame(), renderGameView(), renderHome(), route, STAT_COLS (+6 more)

### Community 1 - "el"
Cohesion: 0.25
Nodes (19): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fmtMean(), iconBtn(), initialsOf() (+11 more)

### Community 2 - "app.py"
Cohesion: 0.18
Nodes (3): get_state(), index(), service_worker()

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 5 - "act"
Cohesion: 0.24
Nodes (13): act(), api(), closePlayerMenu(), confirmDialog(), editingRoundIndex(), fillPlayerMenu(), gameById(), readEntryRow() (+5 more)

### Community 6 - "save"
Cohesion: 0.22
Nodes (11): _default(), delete_game(), delete_player(), delete_round(), _find_game(), _find_player(), GamePatch, load() (+3 more)

### Community 7 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 8 - "create_game"
Cohesion: 0.28
Nodes (6): add_round(), _auto_game_name(), create_game(), GameIn, _new_id(), RoundIn

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "renderChrome"
Cohesion: 0.50
Nodes (4): fmtDate(), moonSvg(), renderChrome(), sunSvg()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderChrome`, `act`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `backup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `_startup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._