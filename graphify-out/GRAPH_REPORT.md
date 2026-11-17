# Graph Report - cambio-scorekeeper  (2026-11-17)

## Corpus Check
- 7 files · ~16,809 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 165 nodes · 391 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0dfbc1d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- ts-cambio
- renderPlayersView
- sync
- save
- manifest.json
- add_round
- create_game
- toggleTheme
- sw.js
- sessionGames
- renderChrome
- backup

## God Nodes (most connected - your core abstractions)
1. `el()` - 24 edges
2. `act()` - 21 edges
3. `load()` - 17 edges
4. `save()` - 17 edges
5. `renderPlayersView()` - 15 edges
6. `renderGame()` - 14 edges
7. `render()` - 14 edges
8. `refresh()` - 12 edges
9. `sync()` - 11 edges
10. `renderStatsView()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `renderGame()` --indirect_call--> `playerById()`  [INFERRED]
  static/app.js → static/app.js  _Bridges community 0 → community 1_
- `add_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 8_
- `create_game()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 9_
- `create_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 5_
- `get_state()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 2_

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.12
Nodes (25): act(), autoGameName(), cachedState(), closePlayerMenu(), confirmDialog(), isNetError(), localApplied(), newId() (+17 more)

### Community 1 - "el"
Cohesion: 0.24
Nodes (16): checkSvg(), computeStats(), el(), entryRowEl(), fillPlayerMenu(), fmtMean(), iconBtn(), logoChip() (+8 more)

### Community 2 - "app.py"
Cohesion: 0.18
Nodes (4): _asset_version(), get_state(), index(), service_worker()

### Community 3 - "ts-cambio"
Cohesion: 0.12
Nodes (16): build, container_name, environment, ports, restart, volumes, services, cambio (+8 more)

### Community 4 - "renderPlayersView"
Cohesion: 0.50
Nodes (9): api(), errorNote(), initialsOf(), newSessionInput(), refresh(), render(), renderPlayersView(), renderSessionsView() (+1 more)

### Community 5 - "sync"
Cohesion: 0.22
Nodes (10): _clean_name(), create_player(), create_session(), _name_taken(), _new_id(), PlayerIn, rename_player(), SessionIn (+2 more)

### Community 6 - "save"
Cohesion: 0.21
Nodes (12): _default(), delete_game(), delete_player(), delete_round(), delete_session(), _find_game(), _find_player(), GamePatch (+4 more)

### Community 7 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 8 - "add_round"
Cohesion: 0.50
Nodes (4): add_round(), edit_round(), RoundIn, _valid_scores()

### Community 9 - "create_game"
Cohesion: 0.29
Nodes (6): _auto_game_name(), create_game(), GameIn, SyncGameIn, SyncPlayerIn, SyncRoundIn

### Community 10 - "toggleTheme"
Cohesion: 0.67
Nodes (4): applyTheme(), currentTheme(), syncThemeColor(), toggleTheme()

### Community 12 - "sessionGames"
Cohesion: 0.29
Nodes (8): editingRoundIndex(), gameById(), gameRow(), latestGame(), renderFooter(), renderGameView(), renderHome(), sessionGames()

### Community 13 - "renderChrome"
Cohesion: 0.33
Nodes (6): activeSession(), fmtDate(), moonSvg(), renderChrome(), sessionPlayers(), sunSvg()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderChrome`, `renderPlayersView`, `sessionGames`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Why does `act()` connect `app.js` to `el`, `toggleTheme`, `renderPlayersView`, `sessionGames`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `ts-cambio` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._