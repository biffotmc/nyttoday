"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calendarDateLocal } from "@/lib/local-calendar";
import { GAME_LABEL, type GameSlug } from "@/lib/types";

export function FuturePuzzleGate({
  slug,
  dateIso,
  children,
}: {
  slug: GameSlug;
  dateIso: string;
  children: React.ReactNode;
}) {
  const [allow, setAllow] = useState<boolean | null>(null);

  useEffect(() => {
    setAllow(dateIso <= calendarDateLocal());
  }, [dateIso]);

  if (allow === null) {
    return (
      <div className="py-16 text-center text-sm text-[var(--muted)]" aria-busy="true">
        Loading…
      </div>
    );
  }

  if (!allow) {
    const label = GAME_LABEL[slug];
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 shadow-[var(--shadow)] sm:px-8">
        <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)]">
          Not available yet
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          That puzzle date is still in the future for your device&apos;s calendar. The
          archive only lists days through today where you are.
        </p>
        <Link
          href={`/games/${slug}`}
          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
        >
          Back to {label} archive
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
