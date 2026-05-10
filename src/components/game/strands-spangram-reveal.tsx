"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { cn } from "@/lib/cn";

export function StrandsSpangramReveal({
  spangram,
  onRevealCountChange,
}: {
  spangram: string;
  /** Fires whenever the count of revealed letters changes (0 … length). */
  onRevealCountChange?: (revealedCount: number) => void;
}) {
  const letters = useMemo(
    () => spangram.toUpperCase().replace(/[^A-Z]/g, "").split(""),
    [spangram],
  );
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    onRevealCountChange?.(revealed);
  }, [revealed, onRevealCountChange]);

  const revealNext = useCallback(() => {
    setRevealed((n) => {
      const next = Math.min(n + 1, letters.length);
      posthog.capture("strands_spangram_letter_revealed", { letter_index: next - 1, total_letters: letters.length });
      return next;
    });
  }, [letters.length]);

  const onTileClick = useCallback(
    (index: number) => {
      if (index === revealed && revealed < letters.length) {
        revealNext();
      }
    },
    [revealed, letters.length, revealNext],
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Reveal the spangram one letter at a time — tap the leftmost hidden tile or use
        the button.
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {letters.map((ch, i) => {
          const shown = i < revealed;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTileClick(i)}
              className={cn(
                "flex min-h-[3.25rem] min-w-[3rem] items-center justify-center rounded-xl px-2 font-mono text-3xl font-bold uppercase leading-none sm:min-h-[4rem] sm:min-w-[3.5rem] sm:text-4xl",
                "ring-2 transition outline-none active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--accent)]/60",
                shown
                  ? "bg-[var(--accent-soft)] text-[var(--foreground)] ring-[var(--border)]"
                  : "cursor-pointer bg-[var(--surface-2)] text-[var(--muted)] ring-[var(--border)] hover:bg-[var(--surface)]",
              )}
              aria-label={shown ? `Letter ${ch}` : "Hidden letter, tap to reveal next"}
            >
              {shown ? ch : "?"}
            </button>
          );
        })}
      </div>
      {revealed < letters.length && (
        <button
          type="button"
          onClick={revealNext}
          className="min-h-12 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-base font-semibold text-white outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Reveal next letter
        </button>
      )}
    </div>
  );
}
