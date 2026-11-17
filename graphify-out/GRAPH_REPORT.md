# Graph Report - cambio-scorekeeper  (2026-11-17)

## Corpus Check
- 7 files · ~16,726 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 165 nodes · 391 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39a22e5f`
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

## God Nodes (most connected - your core abstractions)
1. `el()` - 24 edges
2. `act()` - 21 edges
3. `load()` - 17 edges
4. `save()` - 17 edges
5. `renderPlayersView()` - 15 edges
6. `renderGame()` - 14 edges
7. `render()` - 14 edges
8. `refresh()` - 12 edges
9. `renderChrome()` - 11 edges
10. `renderStatsView()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `act()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 0_
- `errorNote()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 4_
- `gameRow()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 12_
- `iconBtn()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 13_
- `act()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 4 → community 0_

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.13
Nodes (24): act(), autoGameName(), cachedState(), closePlayerMenu(), confirmDialog(), isNetError(), localApplied(), newId() (+16 more)

### Community 1 - "el"
Cohesion: 0.22
Nodes (17): checkSvg(), computeStats(), el(), entryRowEl(), fillPlayerMenu(), fmtMean(), initialsOf(), logoChip() (+9 more)

### Community 2 - "app.py"
Cohesion: 0.13
Nodes (6): _asset_version(), backup(), get_state(), index(), service_worker(), _startup()

### Community 3 - "ts-cambio"
Cohesion: 0.12
Nodes (16): build, container_name, environment, ports, restart, volumes, services, cambio (+8 more)

### Community 4 - "renderPlayersView"
Cohesion: 0.53
Nodes (9): api(), errorNote(), newSessionInput(), refresh(), render(), renderPlayersView(), renderSessionsView(), saveRename() (+1 more)

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
Nodes (6): activeSession(), fmtDate(), iconBtn(), moonSvg(), renderChrome(), sunSvg()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `renderChrome`, `renderPlayersView`, `sessionGames`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Why does `act()` connect `app.js` to `el`, `toggleTheme`, `renderPlayersView`, `sessionGames`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `ts-cambio` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._