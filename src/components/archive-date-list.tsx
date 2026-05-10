"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calendarDateLocal } from "@/lib/local-calendar";
import type { GameSlug } from "@/lib/types";

export function ArchiveDateList({
  slug,
  datesNewestFirst,
}: {
  slug: GameSlug;
  datesNewestFirst: string[];
}) {
  const [cutoff, setCutoff] = useState<string | null>(null);

  useEffect(() => {
    setCutoff(calendarDateLocal());
  }, []);

  if (cutoff === null) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        Loading dates…
      </p>
    );
  }

  const visible = datesNewestFirst.filter((d) => d <= cutoff);

  if (visible.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        No puzzle days through today on your calendar yet. Check back after the next
        release.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {visible.map((d) => (
        <li key={d}>
          <Link
            href={`/games/${slug}/${d}`}
            className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-sm font-semibold shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-[var(--hint-warm)]"
          >
            {d}
          </Link>
        </li>
      ))}
    </ul>
  );
}
