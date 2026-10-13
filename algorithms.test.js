const assert = require('node:assert/strict');
const { bfs, dfs } = require('./algorithms.js');
const { PRESETS } = require('./presets.js');

function endpoints(grid) {
  let start, goal;
  grid.forEach((row, r) => row.forEach((value, c) => { if (value === 'S') start = [r, c]; if (value === 'G') goal = [r, c]; }));
  return { start, goal };
}
function validPath(grid, path) {
  assert.ok(path && path.length >= 2);
  assert.deepEqual(path[0], endpoints(grid).start); assert.deepEqual(path.at(-1), endpoints(grid).goal);
  for (let i = 0; i < path.length; i += 1) {
    const [r, c] = path[i]; assert.notEqual(grid[r][c], 'X');
    if (i) assert.equal(Math.abs(r - path[i - 1][0]) + Math.abs(c - path[i - 1][1]), 1);
  }
}
function bruteDistance(grid, start, goal) {
  const queue = [[start, 0]], seen = new Set([start.join(',')]);
  while (queue.length) {
    const [cell, distance] = queue.shift();
    if (cell[0] === goal[0] && cell[1] === goal[1]) return distance;
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const next = [cell[0] + dr, cell[1] + dc], k = next.join(',');
      if (next[0] >= 0 && next[0] < grid.length && next[1] >= 0 && next[1] < grid[0].length && grid[next[0]][next[1]] !== 'X' && !seen.has(k)) { seen.add(k); queue.push([next, distance + 1]); }
    }
  }
  return null;
}
function validateTrace(result) {
  const required = ['type','cell','from','reason','frontier','visitedCount','line','message'];
  for (const step of result.steps) {
    for (const field of required) assert.ok(Object.hasOwn(step, field), `missing ${field}`);
    assert.ok(['pop','visit','skip','found','done'].includes(step.type));
    assert.ok(Array.isArray(step.frontier)); assert.equal(typeof step.visitedCount, 'number'); assert.equal(typeof step.line, 'number'); assert.equal(typeof step.message, 'string');
  }
  const last = result.steps.at(-1); assert.deepEqual(new Set(last.visited), new Set(result.visited));
}
const reference = PRESETS.default.grid, refPoints = endpoints(reference);
const breadth = bfs(reference, refPoints.start, refPoints.goal), depth = dfs(reference, refPoints.start, refPoints.goal);
validPath(reference, breadth.path); validPath(reference, depth.path);
assert.equal(breadth.path.length - 1, bruteDistance(reference, refPoints.start, refPoints.goal));
validateTrace(breadth); validateTrace(depth);
const longer = PRESETS.longer.grid, longPoints = endpoints(longer);
assert.ok(dfs(longer, longPoints.start, longPoints.goal).path.length > bfs(longer, longPoints.start, longPoints.goal).path.length);
const blocked = PRESETS.noPath.grid, blockedPoints = endpoints(blocked);
assert.equal(bfs(blocked, blockedPoints.start, blockedPoints.goal).path, null);
assert.equal(dfs(blocked, blockedPoints.start, blockedPoints.goal).path, null);
console.log('✓ default BFS and DFS paths are valid; BFS matches independent shortest-distance check');
console.log('✓ DFS is longer than BFS on the detour preset');
console.log('✓ no-path preset returns null for both algorithms');
console.log('✓ recorded events include required fields and final replay snapshot matches visited set');
