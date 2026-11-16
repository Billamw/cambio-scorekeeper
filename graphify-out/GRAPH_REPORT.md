# Graph Report - cambio-scorekeeper  (2026-11-16)

## Corpus Check
- 7 files · ~15,211 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 146 nodes · 339 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9c9b145`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- el
- app.py
- cambio
- act
- create_game
- save
- manifest.json
- sync
- create_player
- toggleTheme
- sw.js
- backup
- edit_round

## God Nodes (most connected - your core abstractions)
1. `el()` - 22 edges
2. `act()` - 20 edges
3. `load()` - 14 edges
4. `save()` - 14 edges
5. `renderGame()` - 14 edges
6. `renderPlayersView()` - 14 edges
7. `render()` - 12 edges
8. `sync()` - 11 edges
9. `refresh()` - 10 edges
10. `create_game()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `add_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 8_
- `create_game()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 5_
- `create_player()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 9_
- `edit_round()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 13_
- `get_state()` --calls--> `load()`  [EXTRACTED]
  app.py → app.py  _Bridges community 6 → community 2_

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.14
Nodes (18): editingRoundIndex(), fmtDate(), gameById(), gameRow(), iconBtn(), latestGame(), moonSvg(), renderChrome() (+10 more)

### Community 1 - "el"
Cohesion: 0.24
Nodes (19): checkSvg(), computeStats(), el(), entryRowEl(), errorNote(), fillPlayerMenu(), fmtMean(), initialsOf() (+11 more)

### Community 2 - "app.py"
Cohesion: 0.17
Nodes (4): _asset_version(), get_state(), index(), service_worker()

### Community 3 - "cambio"
Cohesion: 0.22
Nodes (8): build, container_name, environment, ports, restart, volumes, services, cambio

### Community 4 - "act"
Cohesion: 0.17
Nodes (20): act(), api(), autoGameName(), cachedState(), closePlayerMenu(), confirmDialog(), isNetError(), localApplied() (+12 more)

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

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `app.js`, `act`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `sync()` connect `sync` to `create_player`, `app.py`, `save`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `act()` connect `act` to `app.js`, `el`, `toggleTheme`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._