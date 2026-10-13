/* Grid editing, preset selection, and guaranteed-solvable maze generation. */
(function () {
  let grid = PRESETS.default.grid.map((row) => [...row]);
  let painting = false;
  let paintValue = 'X';
  let draggingMarker = null;
  const clone = (value) => value.map((row) => [...row]);

  function findMarker(marker) {
    for (let r = 0; r < grid.length; r += 1) for (let c = 0; c < grid[r].length; c += 1) if (grid[r][c] === marker) return [r, c];
    return null;
  }
  function getEndpoints() { return { start: findMarker('S'), goal: findMarker('G') }; }
  function getGrid() { return clone(grid); }
  function setGrid(next) { grid = clone(next); if (window.refreshVisualizer) window.refreshVisualizer(); }
  function setPreset(key) { setGrid(PRESETS[key].grid); }
  function randomMaze() {
    const rows = 7, cols = 9;
    let candidate;
    do {
      candidate = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < 0.28 ? 'X' : '.'));
      candidate[0][0] = 'S'; candidate[rows - 1][cols - 1] = 'G';
      // A clear route along the top and right edges guarantees solvability.
      for (let c = 0; c < cols; c += 1) candidate[0][c] = c === 0 ? 'S' : '.';
      for (let r = 0; r < rows; r += 1) candidate[r][cols - 1] = r === rows - 1 ? 'G' : '.';
    } while (!bfs(candidate, [0, 0], [rows - 1, cols - 1]).path);
    setGrid(candidate);
  }
  function cellFromEvent(event) { const cell = event.target.closest('.cell'); return cell ? [Number(cell.dataset.row), Number(cell.dataset.col)] : null; }
  function handleDown(event) {
    if (!document.body.classList.contains('editing')) return;
    const point = cellFromEvent(event); if (!point) return;
    event.preventDefault();
    const [r, c] = point; const value = grid[r][c];
    if (value === 'S' || value === 'G') { draggingMarker = value; return; }
    painting = true; paintValue = value === 'X' ? '.' : 'X'; grid[r][c] = paintValue;
    window.refreshVisualizer();
  }
  function handleMove(event) {
    if (!document.body.classList.contains('editing') || (!painting && !draggingMarker)) return;
    const point = cellFromEvent(event); if (!point) return;
    const [r, c] = point;
    if (draggingMarker) {
      if (grid[r][c] === 'X' || grid[r][c] === draggingMarker) return;
      const old = findMarker(draggingMarker); grid[old[0]][old[1]] = '.'; grid[r][c] = draggingMarker;
    } else if (grid[r][c] === '.') grid[r][c] = paintValue;
    window.refreshVisualizer();
  }
  document.addEventListener('pointerdown', handleDown);
  document.addEventListener('pointerover', handleMove);
  document.addEventListener('pointerup', () => { painting = false; draggingMarker = null; });
  document.addEventListener('pointercancel', () => { painting = false; draggingMarker = null; });
  document.getElementById('presetSelect').addEventListener('change', (event) => { setPreset(event.target.value); document.body.classList.remove('editing'); document.getElementById('editButton').setAttribute('aria-pressed', 'false'); });
  document.getElementById('editButton').addEventListener('click', (event) => {
    const active = document.body.classList.toggle('editing'); event.currentTarget.setAttribute('aria-pressed', String(active));
    document.getElementById('editHint').hidden = !active;
  });
  document.getElementById('randomMazeButton').addEventListener('click', randomMaze);
  document.getElementById('resetGridButton').addEventListener('click', () => setPreset('default'));
  window.GridEditor = { getGrid, setGrid, setPreset, getEndpoints, randomMaze };
}());
