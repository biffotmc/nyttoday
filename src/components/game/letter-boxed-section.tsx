"use client";

import { LetterBoxedBoard } from "@/components/game/letter-boxed-board";
import { cn } from "@/lib/cn";
import type { LetterBoxedCell } from "@/lib/letter-boxed-path";
import { pathForWord } from "@/lib/letter-boxed-path";
import { useCallback, useMemo, useState } from "react";

export function LetterBoxedSection({
  sides,
  par,
  words,
}: {
  sides: string[];
  par?: number | null;
  words: string[];
}) {
  const [shown, setShown] = useState<boolean[]>(() => words.map(() => false));

  const reveal = useCallback((i: number) => {
    setShown((s) => {
      const n = [...s];
      n[i] = true;
      return n;
    });
  }, []);

  const paths = useMemo(() => {
    const out: LetterBoxedCell[][] = [];
    words.forEach((w, i) => {
      if (!shown[i]) return;
      const p = pathForWord(w, sides);
      if (p && p.length > 1) out.push(p);
    });
    return out;
  }, [shown, words, sides]);

  if (!words.length) {
    return (
      <p className="text-sm text-[var(--muted)]">No official solution in data.</p>
    );
  }

  return (
    <div className="space-y-6">
      <LetterBoxedBoard sides={sides} par={par} paths={paths} />

      <div>
        <h2 className="font-serif text-2xl font-semibold">Official solution</h2>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Tap each word to reveal it — letter paths appear on the board above.
          </p>
          <ul className="flex flex-col gap-3">
            {words.map((w, i) =>
              shown[i] ? (
                <li
                  key={i}
                  className="rounded-xl bg-[var(--surface-2)] px-4 py-3 text-center font-mono text-lg font-semibold ring-1 ring-[var(--border)]"
                >
                  {w.toUpperCase()}
                </li>
              ) : (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => reveal(i)}
                    className={cn(
                      "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3",
                      "text-sm font-semibold outline-none transition hover:bg-[var(--surface-2)]",
                      "focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
                    )}
                  >
                    Tap to reveal word {i + 1}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
