"use client";

import { useState, useCallback, useMemo } from "react";
import posthog from "posthog-js";
import type { SpellingBeePangramHint } from "@/lib/types";
import { cn } from "@/lib/cn";

export function SpellingBeeReveal({
  pangramHints,
  pangrams,
  allAnswers,
}: {
  pangramHints: SpellingBeePangramHint[];
  pangrams: string[];
  allAnswers: string[];
}) {
  const merged = useMemo(() => {
    return pangrams.map((word) => {
      const m = pangramHints.find(
        (p) => p.word.toLowerCase() === word.toLowerCase(),
      );
      return { word, hint: m?.hint?.trim() || "" };
    });
  }, [pangrams, pangramHints]);

  const [pgState, setPgState] = useState(() =>
    merged.map(() => ({ hint: false, word: false })),
  );

  const otherWords = useMemo(() => {
    const set = new Set(pangrams.map((p) => p.toLowerCase()));
    return allAnswers.filter((w) => !set.has(w.toLowerCase())).sort();
  }, [allAnswers, pangrams]);

  const [othersShown, setOthersShown] = useState(false);

  const revealHint = useCallback((i: number) => {
    setPgState((s) => {
      const n = [...s];
      n[i] = { ...n[i], hint: true };
      return n;
    });
    posthog.capture("spelling_bee_pangram_hint_revealed", { pangram_index: i });
  }, []);

  const revealWord = useCallback((i: number) => {
    setPgState((s) => {
      const n = [...s];
      n[i] = { ...n[i], word: true };
      return n;
    });
    posthog.capture("spelling_bee_pangram_word_revealed", { pangram_index: i });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h3 className="font-serif text-lg font-semibold">Pangrams</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          For each pangram, reveal a hint, then the word.
        </p>
        <ul className="mt-4 space-y-6">
          {merged.map((p, i) => {
            const st = pgState[i];
            return (
              <li
                key={p.word}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Pangram {i + 1}
                </p>
                <div className="mt-3 space-y-3">
                  {!st.hint ? (
                    <button
                      type="button"
                      onClick={() => revealHint(i)}
                      className={cn(
                        "rounded-xl border border-[var(--border)] bg-[var(--hint-warm)] px-4 py-2 text-sm font-semibold",
                        "outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
                      )}
                    >
                      Tap to reveal hint
                    </button>
                  ) : (
                    <p className="rounded-xl bg-[var(--hint-warm)] px-4 py-3 text-sm leading-relaxed ring-1 ring-[var(--border)]">
                      {p.hint || "No hint in data — re-run ingest."}
                    </p>
                  )}

                  {st.hint && !st.word && (
                    <button
                      type="button"
                      onClick={() => revealWord(i)}
                      className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white outline-none hover:brightness-95"
                    >
                      Tap to reveal pangram
                    </button>
                  )}
                  {st.word && (
                    <p className="font-mono text-lg font-bold text-[var(--accent)]">
                      {p.word.toUpperCase()}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold">Other accepted words</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {otherWords.length} words (not pangrams). Reveal when you want the full list.
        </p>
        {!othersShown ? (
          <button
            type="button"
            onClick={() => {
              setOthersShown(true);
              posthog.capture("spelling_bee_other_words_revealed", { word_count: otherWords.length });
            }}
            className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold outline-none hover:bg-[var(--surface-2)]"
          >
            Tap to reveal all other words
          </button>
        ) : (
          <p className="mt-4 columns-2 gap-x-4 text-sm sm:columns-3">{otherWords.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
