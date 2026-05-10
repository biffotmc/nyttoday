"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import posthog from "posthog-js";
import type { ProgressiveStep } from "@/lib/types";
import { cn } from "@/lib/cn";

function Lightbulb({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-base",
        className,
      )}
      aria-hidden
    >
      💡
    </span>
  );
}

export function ProgressiveHints({ hints }: { hints: ProgressiveStep[] }) {
  const sorted = [...hints].sort((a, b) => a.level - b.level);
  const [revealed, setRevealed] = useState(0);
  const total = sorted.length;

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-5 py-8 text-center text-sm text-[var(--muted)]">
        No hints for this puzzle yet. Run{" "}
        <code className="rounded-md bg-[var(--surface)] px-1.5 py-0.5 text-xs ring-1 ring-[var(--border)]">
          npm run ingest
        </code>{" "}
        with your OpenAI key.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Open one hint at a time — {total} level{total === 1 ? "" : "s"} total.
      </p>

      <ol className="space-y-3">
        {sorted.map((step, i) => {
          const isOpen = i < revealed;
          return (
            <li key={step.level}>
              <Collapsible.Root open={isOpen}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-[box-shadow]",
                    isOpen
                      ? "border-[var(--border)] bg-[var(--hint-warm)] shadow-[var(--shadow)]"
                      : "border-[var(--border)] bg-[var(--surface)] opacity-90",
                  )}
                >
                  <div className="flex gap-3 p-4 sm:p-5">
                    <Lightbulb />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        Hint {i + 1}
                      </p>
                      <Collapsible.Content className="collapsible-hint overflow-hidden">
                        <p className="mt-2 text-base leading-relaxed text-[var(--foreground)]">
                          {step.body}
                        </p>
                      </Collapsible.Content>
                      {!isOpen && (
                        <p className="mt-2 text-sm italic text-[var(--muted)]">
                          Hidden — use the button below.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Collapsible.Root>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-2 pt-1">
        {revealed < total && (
          <button
            type="button"
            onClick={() => {
              setRevealed((r) => r + 1);
              posthog.capture("hint_revealed", { hint_number: revealed + 1, total_hints: total });
            }}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 focus-visible:ring-offset-2 active:brightness-90"
          >
            {revealed === 0 ? "Reveal hint 1" : `Reveal hint ${revealed + 1}`}
          </button>
        )}
        {revealed < total && (
          <button
            type="button"
            onClick={() => {
              setRevealed(total);
              posthog.capture("all_hints_revealed", { total_hints: total, hints_already_shown: revealed });
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2"
          >
            Show all hints
          </button>
        )}
      </div>
    </div>
  );
}
