# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 5 files · ~9,921 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 112 nodes · 274 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `14c8ebcd`
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
- renderPlayersView
- create_game
- create_player
- renderChrome
- delete_player
- backup
- renderGameView

## God Nodes (most connected - your core abstractions)
1. `el()` - 21 edges
2. `act()` - 16 edges
3. `renderGame()` - 15 edges
4. `renderPlayersView()` - 15 edges
5. `load()` - 13 edges
6. `save()` - 13 edges
7. `render()` - 10 edges
8. `renderStatsView()` - 9 edges
9. `create_game()` - 9 edges
10. `suitOf()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `renderGame()` --indirect_call--> `playerById()`  [INFERRED]
  static/app.js → static/app.js  _Bridges community 5 → community 1_
- `gameRow()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 0_
- `moonSvg()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 10_
- `act()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 7 → community 5_
- `renderPlayersView()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 7 → community 1_

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.18
Nodes (11): gameRow(), hashId(), latestGame(), renderHome(), route, STAT_COLS, state, statsSort (+3 more)

### Community 1 - "el"
Cohesion: 0.27
Nodes (19): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fmtMean(), iconBtn(), initialsOf() (+11 more)

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 4 - "patch_game"
Cohesion: 0.29
Nodes (6): edit_round(), GameIn, GamePatch, patch_game(), RoundIn, _valid_scores()

### Community 5 - "act"
Cohesion: 0.33
Nodes (6): act(), closePlayerMenu(), confirmDialog(), playerById(), readEntryRow(), showEntryError()

### Community 6 - "save"
Cohesion: 0.29
Nodes (6): _default(), delete_game(), delete_round(), _find_game(), load(), save()

### Community 7 - "renderPlayersView"
Cohesion: 0.60
Nodes (5): api(), refresh(), render(), renderFooter(), saveRename()

### Community 8 - "create_game"
Cohesion: 0.40
Nodes (4): add_round(), _auto_game_name(), create_game(), _new_id()

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "renderChrome"
Cohesion: 0.29
Nodes (7): applyTheme(), currentTheme(), fmtDate(), moonSvg(), renderChrome(), sunSvg(), toggleTheme()

### Community 11 - "delete_player"
Cohesion: 0.67
Nodes (3): delete_player(), _find_player(), _player_has_round_history()

### Community 13 - "renderGameView"
Cohesion: 0.67
Nodes (3): editingRoundIndex(), gameById(), renderGameView()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderChrome`, `act`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `backup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `_startup()` connect `backup` to `app.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._