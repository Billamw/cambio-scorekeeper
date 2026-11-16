# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 5 files · ~9,677 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 110 nodes · 267 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29bf631f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- cambio
- patch_game
- act
- save
- renderGameView
- create_game
- create_player
- load
- delete_player

## God Nodes (most connected - your core abstractions)
1. `el()` - 20 edges
2. `renderGame()` - 16 edges
3. `act()` - 16 edges
4. `renderPlayersView()` - 15 edges
5. `load()` - 13 edges
6. `save()` - 13 edges
7. `render()` - 10 edges
8. `create_game()` - 9 edges
9. `renderChrome()` - 8 edges
10. `renderStatsView()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `renderGame()` --indirect_call--> `playerById()`  [INFERRED]
  static/app.js → static/app.js  _Bridges community 5 → community 1_
- `gameRow()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 7_
- `moonSvg()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 0_
- `act()` --calls--> `toggleTheme()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 0 → community 5_
- `act()` --calls--> `gameById()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 7 → community 5_

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.19
Nodes (13): applyTheme(), currentTheme(), fmtDate(), moonSvg(), renderChrome(), route, STAT_COLS, state (+5 more)

### Community 1 - "el"
Cohesion: 0.25
Nodes (19): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fmtMean(), hashId(), iconBtn() (+11 more)

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 4 - "patch_game"
Cohesion: 0.29
Nodes (6): edit_round(), GameIn, GamePatch, patch_game(), RoundIn, _valid_scores()

### Community 5 - "act"
Cohesion: 0.27
Nodes (11): act(), api(), closePlayerMenu(), confirmDialog(), playerById(), readEntryRow(), refresh(), render() (+3 more)

### Community 6 - "save"
Cohesion: 0.38
Nodes (4): delete_game(), delete_round(), _find_game(), save()

### Community 7 - "renderGameView"
Cohesion: 0.33
Nodes (6): editingRoundIndex(), gameById(), gameRow(), latestGame(), renderGameView(), renderHome()

### Community 8 - "create_game"
Cohesion: 0.40
Nodes (4): add_round(), _auto_game_name(), create_game(), _new_id()

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "load"
Cohesion: 0.33
Nodes (4): _default(), get_state(), index(), load()

### Community 11 - "delete_player"
Cohesion: 0.67
Nodes (3): delete_player(), _find_player(), _player_has_round_history()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `act`, `renderGameView`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._