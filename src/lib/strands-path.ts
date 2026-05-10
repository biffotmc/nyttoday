/** Find a Strands-style path for `word` on the letter grid (8-neighbor adjacency, no reuse). */

export type StrandsCell = { row: number; col: number };

const DIRS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function findSpangramPath(board: string[], word: string): StrandsCell[] | null {
  const rows = board.length;
  if (!rows) return null;
  const w = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!w.length) return [];

  function dfs(r: number, c: number, i: number, visited: Set<string>): StrandsCell[] | null {
    if (r < 0 || r >= rows || c < 0) return null;
    const rowStr = board[r];
    if (!rowStr || c >= rowStr.length) return null;

    const letter = rowStr[c]?.toUpperCase();
    if (letter !== w[i]) return null;

    const key = `${r},${c}`;
    if (visited.has(key)) return null;
    visited.add(key);

    const cell = { row: r, col: c };
    if (i === w.length - 1) return [cell];

    for (const [dr, dc] of DIRS) {
      const sub = dfs(r + dr, c + dc, i + 1, visited);
      if (sub) return [cell, ...sub];
    }

    visited.delete(key);
    return null;
  }

  for (let r = 0; r < rows; r++) {
    const rowStr = board[r];
    const cols = rowStr?.length ?? 0;
    for (let c = 0; c < cols; c++) {
      const path = dfs(r, c, 0, new Set());
      if (path) return path;
    }
  }

  return null;
}
