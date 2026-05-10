import Link from "next/link";
import type { Metadata } from "next";
import { GAME_LABEL, GAME_SLUGS } from "@/lib/types";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Pick a game, then a date—each page starts with hints and saves full answers for when you want them.",
  alternates: { canonical: absoluteUrl("/games") },
  openGraph: {
    url: absoluteUrl("/games"),
    title: "Game archive · nyt.today",
    description: "Browse Connections, Wordle, Strands, Spelling Bee, and Letter Boxed by day.",
  },
};

export default function GamesIndexPage() {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[var(--shadow)] sm:px-8">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Archive</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Choose a game, then a calendar date. Each page starts with hints and keeps full
          answers tucked away until you open them. For inspiration, see sites like{" "}
          <a
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            href="https://word.tips/connections-hints-today/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Word Tips
          </a>
          .
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {GAME_SLUGS.map((slug) => (
          <li key={slug}>
            <Link
              href={`/games/${slug}`}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 font-medium shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--hint-warm)]"
            >
              {GAME_LABEL[slug]}
              <span className="text-sm text-[var(--accent)]">All dates →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
