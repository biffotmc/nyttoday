"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calendarDateLocal } from "@/lib/local-calendar";

export function HomeRecentDates({ dates }: { dates: string[] }) {
  const [cutoff, setCutoff] = useState<string | null>(null);

  useEffect(() => {
    setCutoff(calendarDateLocal());
  }, []);

  if (cutoff === null) {
    return (
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">
          Recent dates
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
      </section>
    );
  }

  const visible = [...dates].filter((d) => d <= cutoff);
  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">
        Recent dates
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Pick a calendar day for Connections—hints on every page.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {visible.map((d) => (
          <li key={d}>
            <Link
              href={`/games/connections/${d}`}
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium shadow-sm transition hover:border-[var(--accent)]/50 hover:bg-[var(--hint-warm)]"
            >
              {d}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
