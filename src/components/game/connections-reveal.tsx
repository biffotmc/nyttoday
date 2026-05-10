"use client";

import { useState, useCallback } from "react";
import { CONNECTIONS_GROUP_STYLES } from "@/lib/connections-colors";
import { cn } from "@/lib/cn";

export type ConnectionGroup = { title: string; words: string[] };

type GroupReveal = { hint: boolean; title: boolean; words: boolean[] };

function revealButtonClass(disabled?: boolean) {
  return cn(
    "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold",
    "text-[var(--foreground)] shadow-sm outline-none transition",
    "hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
    disabled && "pointer-events-none opacity-40",
  );
}

export function ConnectionsReveal({
  groups,
  groupHints,
}: {
  groups: ConnectionGroup[];
  groupHints: string[];
}) {
  const [state, setState] = useState<GroupReveal[]>(() =>
    groups.map((g) => ({
      hint: false,
      title: false,
      words: g.words.map(() => false),
    })),
  );

  const setHint = useCallback((gi: number) => {
    setState((s) => {
      const n = [...s];
      n[gi] = { ...n[gi], hint: true };
      return n;
    });
  }, []);

  const setTitle = useCallback((gi: number) => {
    setState((s) => {
      const n = [...s];
      n[gi] = { ...n[gi], title: true };
      return n;
    });
  }, []);

  const setWord = useCallback((gi: number, wi: number) => {
    setState((s) => {
      const n = [...s];
      const words = [...n[gi].words];
      words[wi] = true;
      n[gi] = { ...n[gi], words };
      return n;
    });
  }, []);

  return (
    <div className="space-y-8">
      {groups.map((g, gi) => {
        const style =
          CONNECTIONS_GROUP_STYLES[gi] ?? CONNECTIONS_GROUP_STYLES[3];
        const st = state[gi];
        const hintText = groupHints[gi]?.trim() || "A hint for this group will show up here soon.";

        return (
          <section
            key={`${g.title}-${gi}`}
            className={cn(
              "rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow)] sm:p-6",
              style.card,
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", style.bar)} />
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  style.labelClass,
                )}
              >
                {style.label}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                {!st.hint ? (
                  <button type="button" className={revealButtonClass()} onClick={() => setHint(gi)}>
                    Tap to reveal hint
                  </button>
                ) : (
                  <p className="rounded-xl bg-[var(--surface)]/80 px-4 py-3 text-base leading-relaxed ring-1 ring-[var(--border)]">
                    {hintText}
                  </p>
                )}
              </div>

              <div>
                {!st.hint ? null : !st.title ? (
                  <button
                    type="button"
                    className={revealButtonClass()}
                    onClick={() => setTitle(gi)}
                  >
                    Tap to reveal category title
                  </button>
                ) : (
                  <p className="connections-category-title font-serif text-lg font-semibold leading-snug">
                    {g.title}
                  </p>
                )}
              </div>

              {st.title && (
                <ul className="flex flex-wrap gap-2.5">
                  {g.words.map((w, wi) =>
                    st.words[wi] ? (
                      <li
                        key={w}
                        className={cn(
                          "rounded-xl px-4 py-2.5 font-mono text-sm font-bold uppercase shadow-sm sm:text-base",
                          style.wordPill,
                        )}
                      >
                        {w}
                      </li>
                    ) : (
                      <li key={w}>
                        <button
                          type="button"
                          className={revealButtonClass()}
                          onClick={() => setWord(gi, wi)}
                        >
                          Tap to reveal word
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
