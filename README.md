# BFS & DFS Lab

An offline, dependency-free teaching app for comparing breadth-first search (BFS) and depth-first search (DFS). It uses plain HTML, CSS, and JavaScript and works from `file://`.

## Run

Double-click `index.html`, or serve this folder locally:

```sh
cd bfs_and_dfs_example
python3 -m http.server
```

Then open <http://localhost:8000>.

## Verify algorithms

```sh
node algorithms.test.js
node --check algorithms.js
node --check presets.js
node --check visualizer.js
node --check game.js
node --check editor.js
```

No network requests or third-party packages are used.

## How it works

`algorithms.js` contains pure `bfs()`, `dfs()`, and `reconstructPath()` functions. Both searches use up/down/left/right neighbor order and mark cells as visited when adding them to the frontier. BFS removes the oldest entry with `shift()`; DFS removes the newest entry with `pop()`. Each returns its path and a detailed event log with a snapshot of frontier and visited state. The visualizer renders a chosen snapshot from scratch, so moving backward cannot desynchronize the grid. The game reads expected exploration order from the same event log.

The fixed default grid is the reference matrix from the assignment. Presets also show a longer DFS route, a blocked goal, and a larger search. The editor supports wall painting and moving S/G, and can generate a random grid with a guaranteed clear route along its top and right edges.

## Extend

Add a grid to `presets.js` and add a matching `<option>` when you want it available to the game. For a new search algorithm, keep the trace event shape consistent and update its code panel and game selection to consume that trace.
