# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 5 files · ~9,616 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 109 nodes · 264 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8635be43`
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
- load
- delete_player
- renderStatsView

## God Nodes (most connected - your core abstractions)
1. `el()` - 19 edges
2. `act()` - 16 edges
3. `renderGame()` - 15 edges
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
- `errorNote()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 7_
- `gameRow()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 0_
- `renderStatsView()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 12_
- `act()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 7 → community 5_

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.16
Nodes (16): applyTheme(), currentTheme(), fmtDate(), gameRow(), latestGame(), moonSvg(), renderChrome(), renderHome() (+8 more)

### Community 1 - "el"
Cohesion: 0.33
Nodes (11): checkSvg(), el(), entryRowEl(), iconBtn(), initialsOf(), pencilSvg(), playerCard(), renderGame() (+3 more)

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 4 - "patch_game"
Cohesion: 0.29
Nodes (6): edit_round(), GameIn, GamePatch, patch_game(), RoundIn, _valid_scores()

### Community 5 - "act"
Cohesion: 0.29
Nodes (8): act(), closePlayerMenu(), confirmDialog(), editingRoundIndex(), gameById(), playerById(), readEntryRow(), showEntryError()

### Community 6 - "save"
Cohesion: 0.38
Nodes (4): delete_game(), delete_round(), _find_game(), save()

### Community 7 - "renderPlayersView"
Cohesion: 0.50
Nodes (8): api(), errorNote(), refresh(), render(), renderFooter(), renderGameView(), renderPlayersView(), saveRename()

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

### Community 12 - "renderStatsView"
Cohesion: 0.40
Nodes (5): computeStats(), fmtMean(), hashId(), renderStatsView(), suitOf()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderStatsView`, `act`, `renderPlayersView`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._