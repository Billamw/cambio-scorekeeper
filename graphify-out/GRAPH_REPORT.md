# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~13,787 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 128 nodes · 289 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75e3854d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- cambio
- renderPlayersView
- act
- save
- manifest.json
- create_game
- create_player
- toggleTheme
- sw.js
- backup
- delete_player

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
- `renderGame()` --indirect_call--> `playerById()`  [INFERRED]
  static/app.js → static/app.js  _Bridges community 5 → community 1_
- `add_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 8_
- `create_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 9_
- `delete_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 13_
- `get_state()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 2_

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.17
Nodes (14): checkSvg(), fmtDate(), gameRow(), latestGame(), moonSvg(), renderChrome(), renderHome(), route (+6 more)

### Community 1 - "el"
Cohesion: 0.31
Nodes (14): computeStats(), el(), entryRowEl(), fmtMean(), iconBtn(), logoChip(), pencilSvg(), playerCard() (+6 more)

### Community 2 - "app.py"
Cohesion: 0.17
Nodes (4): _asset_version(), get_state(), index(), service_worker()

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 4 - "renderPlayersView"
Cohesion: 0.42
Nodes (9): api(), errorNote(), initialsOf(), refresh(), render(), renderFooter(), renderGameView(), renderPlayersView() (+1 more)

### Community 5 - "act"
Cohesion: 0.28
Nodes (9): act(), closePlayerMenu(), confirmDialog(), editingRoundIndex(), fillPlayerMenu(), gameById(), playerById(), readEntryRow() (+1 more)

### Community 6 - "save"
Cohesion: 0.22
Nodes (10): _default(), delete_game(), delete_round(), edit_round(), _find_game(), GamePatch, load(), patch_game() (+2 more)

### Community 7 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 8 - "create_game"
Cohesion: 0.28
Nodes (6): add_round(), _auto_game_name(), create_game(), GameIn, _new_id(), RoundIn

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "toggleTheme"
Cohesion: 0.67
Nodes (4): applyTheme(), currentTheme(), syncThemeColor(), toggleTheme()

### Community 13 - "delete_player"
Cohesion: 0.67
Nodes (3): delete_player(), _find_player(), _player_has_round_history()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderPlayersView`, `act`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `backup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `_startup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._