/** Map a solution word to Letter Boxed perimeter cells (side 0–3, index 0–2).
 * Consecutive letters must sit on different sides (NYT Letter Boxed rule). */

export type LetterBoxedCell = { side: number; idx: number };

export function pathForWord(word: string, sides: string[]): LetterBoxedCell[] | null {
  const normalized = sides.map((s) =>
    (s || "   ").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, " ").split(""),
  );
  const positions = new Map<string, LetterBoxedCell[]>();
  for (let side = 0; side < 4; side++) {
    for (let idx = 0; idx < 3; idx++) {
      const ch = normalized[side][idx];
      if (ch === " ") continue;
      const arr = positions.get(ch) ?? [];
      arr.push({ side, idx });
      positions.set(ch, arr);
    }
  }

  const w = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!w.length) return [];

  function dfs(i: number, prevSide: number): LetterBoxedCell[] | null {
    if (i >= w.length) return [];
    const ch = w[i];
    const opts = positions.get(ch);
    if (!opts?.length) return null;
    const candidates = opts.filter((o) => i === 0 || o.side !== prevSide);
    for (const o of candidates) {
      const tail = dfs(i + 1, o.side);
      if (tail !== null) return [o, ...tail];
    }
    return null;
  }

  return dfs(0, -1);
}
