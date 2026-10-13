const PRESETS = {
  small: {
    name: 'Small grid',
    grid: [['S','.','.'],['.','X','.'],['.','.','G']]
  },
  default: {
    name: 'Reference grid',
    grid: [['S','.','.','X','G'],['X','X','.','X','.'],['X','.','.','X','.'],['.','.','X','X','.'],['.','.','.','.','.']]
  },
  longer: {
    name: 'DFS takes a detour',
    grid: [['S','.','.','.','.'],['.','X','X','X','.'],['G','.','.','.','.']]
  },
  noPath: {
    name: 'No path',
    grid: [['S','X','X','G'],['X','X','X','X'],['.','.','.','.'],['.','.','.','.']]
  },
  large: {
    name: 'Large grid',
    grid: [['S','.','.','.','X','.','.','.'],['X','X','.','X','X','.','X','.'],['.','.','.','.','.','.','X','.'],['.','X','X','X','.','X','X','.'],['.','.','.','X','.','.','.','.'],['X','X','.','X','X','X','.','X'],['.','.','.','.','.','.','.','G']]
  }
};
if (typeof module !== 'undefined') module.exports = { PRESETS };
if (typeof window !== 'undefined') window.PRESETS = PRESETS;
