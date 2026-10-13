/* Replays immutable algorithm traces; every frame is rendered from its snapshot. */
(function () {
  const code = [
    'frontier = [start]', 'visited = { start }', 'while frontier:', '  current = frontier.shift()  // BFS', '  if current == goal: break', '  for next in up, down, left, right:', '    if next outside grid: skip', '    if next is a wall: skip', '    if next in visited: skip', '    visited.add(next)', '    parent[next] = current; frontier.push(next)', 'return reconstructPath(parent, goal)'
  ];
  const states = { bfs: null, dfs: null };
  let playing = false, timer = null, stepIndex = 0;
  const key = (cell) => cell.join(',');
  function endpoints(grid) {
    let start = null, goal = null;
    grid.forEach((row, r) => row.forEach((cell, c) => { if (cell === 'S') start = [r, c]; if (cell === 'G') goal = [r, c]; }));
    return { start, goal };
  }
  function makeState(name, algorithm) {
    const grid = GridEditor.getGrid(), { start, goal } = endpoints(grid);
    if (!start || !goal) return null;
    return { name, grid, result: algorithm(grid, start, goal), index: 0 };
  }
  function cellClass(state, r, c, frame) {
    const value = state.grid[r][c], k = `${r},${c}`, frontier = (frame.frontier || []).some((item) => key(item) === k);
    const visited = (frame.visited || []).includes(k), path = state.result.path && state.result.path.some((item) => key(item) === k);
    return [value === 'X' ? 'wall' : '', value === 'S' ? 'start' : '', value === 'G' ? 'goal' : '', visited ? 'visited' : '', frontier ? 'frontier' : '', frame.cell && key(frame.cell) === k && frame.type === 'pop' ? 'current' : '', path && state.index >= state.result.steps.length - 1 ? 'path' : '', document.body.classList.contains('editing') ? 'editable' : ''].filter(Boolean).join(' ');
  }
  function render(name, requestedIndex) {
    const state = states[name]; if (!state) return;
    state.index = Math.max(0, Math.min(requestedIndex, state.result.steps.length - 1));
    const frame = state.result.steps[state.index];
    const gridEl = document.getElementById(`${name}Grid`); gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${state.grid[0].length}, auto)`;
    state.grid.forEach((row, r) => row.forEach((value, c) => {
      const k = `${r},${c}`, cell = document.createElement('div'); cell.className = `cell ${cellClass(state, r, c, frame)}`; cell.dataset.row = r; cell.dataset.col = c;
      cell.setAttribute('aria-label', `${value === 'S' ? 'Start' : value === 'G' ? 'Goal' : value === 'X' ? 'Wall' : 'Cell'} row ${r + 1}, column ${c + 1}${state.result.order[k] ? `, explored ${state.result.order[k]}` : ''}`);
      const glyph = value === 'S' ? 'S' : value === 'G' ? '⚑' : value === 'X' ? '' : '';
      cell.innerHTML = `${glyph ? `<span class="glyph">${glyph}</span>` : ''}${state.result.order[k] ? `<span class="order">${state.result.order[k]}</span>` : ''}${name === 'bfs' && state.result.distance[k] !== undefined ? `<span class="distance">d${state.result.distance[k]}</span>` : ''}`;
      gridEl.appendChild(cell);
    }));
    const frontier = document.getElementById(`${name}Frontier`); frontier.replaceChildren();
    frame.frontier.forEach((item) => { const chip = document.createElement('span'); chip.className = 'frontier-item'; chip.textContent = `(${item[0]},${item[1]})`; frontier.appendChild(chip); });
    document.getElementById(`${name}Message`).textContent = frame.message;
    document.getElementById(`${name}Stats`).innerHTML = `<span>Cells explored: <b>${frame.visitedCount}</b></span><span>Path length: <b>${state.result.path ? state.result.path.length - 1 : '—'}</b></span><span>Steps taken: <b>${state.index + 1} / ${state.result.steps.length}</b></span>`;
    const codeEl = document.getElementById(`${name}Code`), shown = code.map((line, i) => `<span class="code-line ${frame.line === i + 1 ? 'active' : ''}">${String(i + 1).padStart(2, ' ')}  ${name === 'dfs' && i === 3 ? '  current = frontier.pop()  // DFS <span class="shift-marker">← newest item</span>' : name === 'bfs' && i === 3 ? '  current = frontier.shift() // BFS <span class="shift-marker">← oldest item</span>' : line.replaceAll('<','&lt;')}</span>`).join(''); codeEl.innerHTML = shown;
  }
  function renderAll(index) { stepIndex = index; render('bfs', index); render('dfs', index); updateComparison(); }
  function updateComparison() {
    const done = states.bfs && states.dfs && states.bfs.index === states.bfs.result.steps.length - 1 && states.dfs.index === states.dfs.result.steps.length - 1;
    const box = document.getElementById('comparison'); box.hidden = !done; if (!done) return;
    const a = states.bfs.result, b = states.dfs.result;
    box.innerHTML = `<h2>What did these searches find?</h2><div class="comparison-grid"><div class="comparison-item">BFS · queue<strong>${a.path ? `${a.path.length - 1} moves` : 'No path'}</strong>${a.explored} cells explored · shortest guaranteed</div><div class="comparison-item">DFS · stack<strong>${b.path ? `${b.path.length - 1} moves` : 'No path'}</strong>${b.explored} cells explored · shortest not guaranteed</div></div><p>${a.path && b.path && a.path.length < b.path.length ? 'BFS found a shorter route because it explores by distance from S.' : 'BFS explores in distance layers, so any path it finds is a shortest route.'}</p>`;
  }
  function refreshVisualizer() { states.bfs = makeState('bfs', bfs); states.dfs = makeState('dfs', dfs); stepIndex = 0; renderAll(0); }
  function stop() { playing = false; clearInterval(timer); document.getElementById('playButton').textContent = '▶ Play'; }
  function maxSteps() { return Math.max(states.bfs.result.steps.length, states.dfs.result.steps.length); }
  function advance(delta) {
    if (!states.bfs || !states.dfs) return;
    const next = Math.max(0, Math.min(maxSteps() - 1, stepIndex + delta)); renderAll(next);
    if (next === maxSteps() - 1) stop();
  }
  document.getElementById('playButton').addEventListener('click', () => {
    if (playing) { stop(); return; } playing = true; document.getElementById('playButton').textContent = 'Ⅱ Pause';
    timer = setInterval(() => advance(1), 1200 - Number(document.getElementById('speed').value) * 100);
  });
  document.getElementById('stepButton').addEventListener('click', () => advance(1));
  document.getElementById('backButton').addEventListener('click', () => advance(-1));
  document.getElementById('resetButton').addEventListener('click', () => { stop(); renderAll(0); });
  document.getElementById('themeButton').addEventListener('click', () => document.body.classList.toggle('dark'));
  document.getElementById('showTrails').addEventListener('change', () => renderAll(stepIndex));
  document.getElementById('showParents').addEventListener('change', () => renderAll(stepIndex));
  document.getElementById('predictMode').addEventListener('change', (event) => { if (event.target.checked) document.getElementById('bfsMessage').textContent = 'Predict the next cell: which BFS queue item leaves next?'; });
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
    document.getElementById('visualizerView').hidden = tab.dataset.tab !== 'visualizer'; document.getElementById('gameView').hidden = tab.dataset.tab !== 'game';
  }));
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input,select,button')) return;
    if (event.code === 'Space') { event.preventDefault(); document.getElementById('playButton').click(); }
    if (event.key === 'ArrowRight') advance(1); if (event.key === 'ArrowLeft') advance(-1); if (event.key.toLowerCase() === 'r') document.getElementById('resetButton').click();
  });
  document.addEventListener('click', (event) => {
    if (!document.getElementById('predictMode').checked || !event.target.matches('.cell')) return;
    const expected = states.bfs.result.steps.slice(0, stepIndex + 1).find((step) => step.type === 'pop');
    const clicked = [Number(event.target.dataset.row), Number(event.target.dataset.col)];
    document.getElementById('bfsMessage').textContent = expected && key(expected.cell) === key(clicked) ? 'Correct! BFS removes the oldest cell at the front.' : 'Try again: BFS removes the oldest discovered cell from the front of its queue.';
  });
  const select = document.getElementById('presetSelect');
  Object.entries(PRESETS).forEach(([key, preset]) => { const option = document.createElement('option'); option.value = key; option.textContent = preset.name; select.appendChild(option); });
  window.render = render; window.refreshVisualizer = refreshVisualizer;
  refreshVisualizer();
}());
