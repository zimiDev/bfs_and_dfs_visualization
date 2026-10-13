/* The expected play order is read directly from the shared algorithm step log. */
(function () {
  let game = null, score = 0, cursor = 0;
  const key = (cell) => cell.join(',');
  const gridEl = document.getElementById('gameGrid');
  function startGame() {
    const difficulty = document.getElementById('gameDifficulty').value;
    const presetKey = difficulty === 'default' ? 'default' : difficulty === 'large' ? 'large' : 'small';
    const grid = PRESETS[presetKey].grid.map((row) => [...row]);
    const start = [], goal = [];
    grid.forEach((row, r) => row.forEach((value, c) => { if (value === 'S') start.push(r,c); if (value === 'G') goal.push(r,c); }));
    const algorithm = document.getElementById('gameAlgorithm').value;
    const result = (algorithm === 'bfs' ? bfs : dfs)(grid, start, goal);
    // A pop is an expected click. This derives game order from the canonical trace.
    const expected = result.steps.filter((step) => step.type === 'pop').map((step) => step.cell);
    game = { grid, result, expected, algorithm, found: new Set(), frontier: [start], done: false }; score = 0; cursor = 0;
    render(); message(`Game started. Click the next cell that leaves the ${algorithm === 'bfs' ? 'queue (oldest first)' : 'stack (newest first)'}.`);
  }
  function render() {
    if (!game) return;
    gridEl.replaceChildren(); gridEl.style.gridTemplateColumns = `repeat(${game.grid[0].length}, auto)`;
    game.grid.forEach((row, r) => row.forEach((value, c) => {
      const cell = document.createElement('button'); cell.className = `cell ${value === 'X' ? 'wall' : value === 'S' ? 'start' : value === 'G' ? 'goal' : ''} ${game.found.has(`${r},${c}`) ? 'current' : ''}`; cell.dataset.row = r; cell.dataset.col = c;
      cell.textContent = value === 'G' ? '⚑' : value === 'X' ? '' : value; cell.setAttribute('aria-label', `${value === 'S' ? 'Start' : value === 'G' ? 'Goal' : value === 'X' ? 'Wall' : 'Cell'} row ${r + 1}, column ${c + 1}`); cell.addEventListener('click', () => choose([r,c])); gridEl.appendChild(cell);
    }));
    document.getElementById('score').textContent = score;
    const frontier = document.getElementById('gameFrontier'); frontier.replaceChildren();
    game.frontier.forEach((item) => { const chip = document.createElement('span'); chip.className = 'frontier-item'; chip.textContent = `(${item[0]},${item[1]})`; frontier.appendChild(chip); });
    document.getElementById('gameFrontierTitle').textContent = game.algorithm === 'bfs' ? 'Queue · oldest out first' : 'Stack · newest out first';
    document.getElementById('gameProgress').textContent = `Exploration ${Math.min(cursor + 1, game.expected.length)} of ${game.expected.length}`;
  }
  function message(text, error) { const box = document.getElementById('gameMessage'); box.textContent = text; box.classList.toggle('shake', Boolean(error)); if (error) setTimeout(() => box.classList.remove('shake'), 400); }
  function choose(cell) {
    if (!game || game.done) return;
    const expected = game.expected[cursor];
    if (!expected) return;
    if (key(cell) !== key(expected)) { const hint = game.algorithm === 'bfs' ? 'BFS takes the OLDEST item from the front of its queue' : 'DFS takes the NEWEST item from the top of its stack'; message(`Not yet. ${hint}: (${expected[0]},${expected[1]}).`, true); return; }
    game.found.add(key(cell)); game.frontier = game.frontier.filter((item) => key(item) !== key(cell)); score += 10; cursor += 1;
    // New frontier entries after this pop are copied from the recorded shared trace.
    const traceIndex = game.result.steps.findIndex((step, index) => step.type === 'pop' && key(step.cell) === key(cell) && index >= (game.lastTraceIndex || 0));
    if (traceIndex >= 0) {
      const trace = game.result.steps[traceIndex]; game.lastTraceIndex = traceIndex + 1;
      const nextPop = game.result.steps.slice(traceIndex + 1).find((step) => step.type === 'pop');
      if (nextPop) game.frontier = nextPop.frontier.map((item) => [...item]);
    }
    if (cell[0] === game.result.path?.at(-1)?.[0] && cell[1] === game.result.path?.at(-1)?.[1]) { game.done = true; message(`Finished! You explored ${cursor} cells and scored ${score} points.`); document.getElementById('gameMessage').classList.add('game-done'); }
    else message('Correct! The neighboring cells were added to the frontier automatically.');
    render();
  }
  document.getElementById('gameStart').addEventListener('click', startGame);
  document.getElementById('hintButton').addEventListener('click', () => { if (!game || game.done) return; const cell = game.expected[cursor]; message(`Hint: take the ${game.algorithm === 'bfs' ? 'oldest queue item' : 'newest stack item'} at (${cell[0]},${cell[1]}).`); });
}());
