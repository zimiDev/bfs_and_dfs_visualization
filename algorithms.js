/* Pure graph-search logic. The browser UI and the game both consume this trace. */
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function reconstructPath(parent, goal) {
  const path = [];
  let current = goal;
  while (current) {
    path.unshift(current);
    current = parent.get(`${current[0]},${current[1]}`) || null;
  }
  return path;
}

function search(grid, start, goal, useStack) {
  const frontier = [[...start]];
  const visited = new Set([`${start[0]},${start[1]}`]);
  const parent = new Map();
  const distance = new Map([[`${start[0]},${start[1]}`, 0]]);
  const order = new Map();
  const steps = [];
  let explored = 0;
  let found = false;
  const snapshot = () => frontier.map((cell) => [...cell]);
  const record = (type, cell, from, reason, line, message) => steps.push({
    type, cell: cell ? [...cell] : null, from: from ? [...from] : null, reason,
    frontier: snapshot(), visitedCount: explored, line, message,
    visited: [...visited], order: Object.fromEntries(order), distance: Object.fromEntries(distance)
  });
  const key = ([r, c]) => `${r},${c}`;

  // BFS and DFS both mark cells when pushed, preventing duplicate frontier entries.
  // DFS uses this same policy so its trace and code stay parallel with BFS.
  while (frontier.length) {
    const current = useStack ? frontier.pop() : frontier.shift();
    const currentKey = key(current);
    explored += 1;
    order.set(currentKey, explored);
    record('pop', current, parent.get(currentKey) || null, null, 4,
      `${useStack ? 'DFS pops the newest cell from the top of its stack' : 'BFS removes the oldest cell from the front of its queue'}: (${current[0]},${current[1]}).`);
    if (current[0] === goal[0] && current[1] === goal[1]) {
      found = true;
      record('found', current, parent.get(currentKey) || null, null, 5, 'Goal reached. Follow the parent links to recover this route.');
      break;
    }
    for (const [dr, dc] of DIRECTIONS) {
      const next = [current[0] + dr, current[1] + dc];
      const [nr, nc] = next;
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) {
        record('skip', next, current, 'out of bounds', 7, `(${nr},${nc}) is outside the grid, so it is skipped.`);
      } else if (grid[nr][nc] === 'X') {
        record('skip', next, current, 'wall', 8, `(${nr},${nc}) is a wall, so it is skipped.`);
      } else if (visited.has(key(next))) {
        record('skip', next, current, 'already visited', 9, `(${nr},${nc}) was already discovered, so it is skipped.`);
      } else {
        visited.add(key(next));
        parent.set(key(next), current);
        distance.set(key(next), distance.get(currentKey) + 1);
        frontier.push(next);
        record('visit', next, current, null, 10, `(${nr},${nc}) is added to the ${useStack ? 'top of the stack' : 'back of the queue'}.`);
      }
    }
  }
  const path = found ? reconstructPath(parent, goal) : null;
  record('done', found ? goal : null, null, null, 12, path ? `Search complete: route has ${path.length - 1} moves.` : 'Search complete: no route connects S to G.');
  return { path, steps, visited: [...visited], order: Object.fromEntries(order), distance: Object.fromEntries(distance), explored };
}

function bfs(grid, start, goal) { return search(grid, start, goal, false); }
function dfs(grid, start, goal) { return search(grid, start, goal, true); }

if (typeof module !== 'undefined') module.exports = { bfs, dfs, reconstructPath, DIRECTIONS };
if (typeof window !== 'undefined') Object.assign(window, { bfs, dfs, reconstructPath, DIRECTIONS });
