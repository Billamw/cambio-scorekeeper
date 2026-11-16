# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~15,171 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 146 nodes · 337 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aef15b73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- cambio
- render
- create_game
- save
- manifest.json
- sync
- create_player
- toggleTheme
- sw.js
- backup
- edit_round
- gameById
- renderChrome

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
- `act()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 0_
- `gameRow()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 14_
- `iconBtn()` --calls--> `el()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 1 → community 15_
- `act()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 4 → community 0_
- `renderPlayersView()` --calls--> `api()`  [EXTRACTED]
  static/app.js → static/app.js  _Bridges community 4 → community 1_

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.15
Nodes (17): act(), autoGameName(), cachedState(), closePlayerMenu(), confirmDialog(), newId(), readEntryRow(), route (+9 more)

### Community 1 - "el"
Cohesion: 0.23
Nodes (19): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fillPlayerMenu(), fmtMean(), initialsOf() (+11 more)

### Community 2 - "app.py"
Cohesion: 0.17
Nodes (4): _asset_version(), get_state(), index(), service_worker()

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

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
Cohesion: 0.32
Nodes (5): add_round(), _new_id(), sync(), SyncIn, _valid_scores()

### Community 9 - "create_player"
Cohesion: 0.47
Nodes (5): _clean_name(), create_player(), _name_taken(), PlayerIn, rename_player()

### Community 10 - "toggleTheme"
Cohesion: 0.67
Nodes (4): applyTheme(), currentTheme(), syncThemeColor(), toggleTheme()

### Community 14 - "gameById"
Cohesion: 0.33
Nodes (6): editingRoundIndex(), gameById(), gameRow(), latestGame(), renderGameView(), renderHome()

### Community 15 - "renderChrome"
Cohesion: 0.40
Nodes (5): fmtDate(), iconBtn(), moonSvg(), renderChrome(), sunSvg()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `gameById`, `renderChrome`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Why does `sync()` connect `sync` to `create_player`, `app.py`, `save`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `act()` connect `app.js` to `el`, `toggleTheme`, `render`, `gameById`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._