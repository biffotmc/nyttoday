"use client";

import { useState, useCallback } from "react";
import type { ProgressiveStep } from "@/lib/types";
import { WORDLE_HINTS_BLURB } from "@/lib/ui-copy";
import { cn } from "@/lib/cn";

export function WordleRevealFlow({
  hints,
  solution,
}: {
  hints: ProgressiveStep[];
  solution: string;
}) {
  const sorted = [...hints].sort((a, b) => a.level - b.level).slice(0, 3);
  const letters = solution.toUpperCase().split("");
  const [hintStep, setHintStep] = useState(0);
  const [letterRevealed, setLetterRevealed] = useState(0);

  const nextHint = useCallback(() => setHintStep((s) => Math.min(s + 1, sorted.length)), [sorted.length]);

  const revealNextLetter = useCallback(() => {
    setLetterRevealed((n) => Math.min(n + 1, letters.length));
  }, [letters.length]);

  const onLetterClick = useCallback(
    (i: number) => {
      if (i === letterRevealed && letterRevealed < letters.length) revealNextLetter();
    },
    [letterRevealed, letters.length, revealNextLetter],
  );

  const hintsDone = sorted.length === 0 || hintStep >= sorted.length;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Hints (3)
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{WORDLE_HINTS_BLURB}</p>
        <ol className="mt-3 space-y-3">
          {sorted.map((h, i) => (
            <li
              key={h.level}
              className={cn(
                "rounded-2xl border border-[var(--border)] p-4",
                i < hintStep ? "bg-[var(--hint-warm)]" : "bg-[var(--surface)]",
              )}
            >
              <span className="text-xs font-semibold text-[var(--muted)]">Hint {i + 1}</span>
              {i < hintStep ? (
                <p className="mt-2 text-base leading-relaxed">{h.body}</p>
              ) : (
                <p className="mt-2 text-sm italic text-[var(--muted)]">Tap below to reveal</p>
              )}
            </li>
          ))}
        </ol>
        {sorted.length === 0 && (
          <p className="mt-2 text-sm text-[var(--muted)]">Run ingest to generate Wordle hints.</p>
        )}
        {hintStep < sorted.length && sorted.length > 0 && (
          <button
            type="button"
            onClick={nextHint}
            className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white outline-none hover:brightness-95"
          >
            {hintStep === 0 ? "Reveal hint 1" : `Reveal hint ${hintStep + 1}`}
          </button>
        )}
      </div>

      {hintsDone && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Solution — letter by letter
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Tap the leftmost hidden tile, or use the button.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
            {letters.map((ch, i) => {
              const shown = i < letterRevealed;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onLetterClick(i)}
                  className={cn(
                    "flex min-h-[3.25rem] min-w-[3rem] items-center justify-center rounded-xl border-2 border-transparent px-2 font-mono text-3xl font-bold leading-none sm:min-h-[4rem] sm:min-w-[3.5rem] sm:text-4xl",
                    "outline-none transition active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--accent)]/60",
                    shown ? "wordle-tile--revealed" : "wordle-tile--hidden",
                  )}
                  aria-label={shown ? `Letter ${ch}` : "Hidden, reveal next"}
                >
                  {shown ? ch : "?"}
                </button>
              );
            })}
          </div>
          {letterRevealed < letters.length && (
            <button
              type="button"
              onClick={revealNextLetter}
              className="mt-5 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-base font-semibold outline-none hover:bg-[var(--surface-2)]"
            >
              Reveal next letter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
