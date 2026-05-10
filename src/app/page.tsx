import Link from "next/link";
import type { Metadata } from "next";
import { HomeRecentDates } from "@/components/home-recent-dates";
import { GAME_LABEL, GAME_SLUGS, type GameSlug } from "@/lib/types";
import { gameTodayVanityPath } from "@/lib/game-vanity-paths";
import { latestDate, listAvailableDates } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

const blurbs: Record<GameSlug, string> = {
  connections: "Sort 16 words into four groups—get gentle hints before you peek at answers.",
  wordle: "Five-letter word game—clues first, then uncover the answer slowly.",
  strands: "Find the theme and spangram on the woven board, with nudges when you want them.",
  "letter-boxed": "Use letters from the sides of the square—see the solution when you’re ready.",
  "spelling-bee": "See pangram hints and full word lists only when you choose.",
};

const emoji: Record<GameSlug, string> = {
  connections: "🔗",
  wordle: "🟩",
  strands: "🧵",
  "letter-boxed": "🔠",
  "spelling-bee": "🐝",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "nyt.today — Daily hints for NYT Games" },
    description:
      "Friendly hints and answers for Connections, Wordle, Strands, Spelling Bee, and Letter Boxed. You choose when to see solutions.",
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      url: absoluteUrl("/"),
      title: "nyt.today — Daily hints for NYT Games",
      description:
        "Hints and answers for popular daily word games—only show what you want to see.",
    },
  };
}

export default async function Home() {
  const dates = await listAvailableDates();
  const recent = dates.slice(-7).reverse();
  const last = latestDate(dates);

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 shadow-[var(--shadow)] sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          Daily puzzle helpers
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          Hints &amp; answers for your favorite NYT-style games
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Hints first, answers when you ask for them—so you can enjoy the solve without
          tripping over spoilers.
        </p>
        {recent.length > 0 && last && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[var(--muted)]">Try it:</span>
            <Link
              href={gameTodayVanityPath("connections")}
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Today’s Connections ({last})
            </Link>
            <Link
              href="/games"
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--surface-2)]"
            >
              Browse archive
            </Link>
          </div>
        )}
      </section>

      {recent.length > 0 ? <HomeRecentDates dates={recent} /> : null}

      <section>
        <h2 className="font-serif text-2xl font-semibold">All games</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Simple pages for each game—nothing fussy, nothing hidden.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_SLUGS.map((slug) => {
            const href = last ? gameTodayVanityPath(slug) : `/games/${slug}`;
            return (
              <Link
                key={slug}
                href={href}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
              >
                <span className="text-3xl" aria-hidden>
                  {emoji[slug]}
                </span>
                <h3 className="mt-3 font-serif text-xl font-semibold group-hover:text-[var(--accent)]">
                  {GAME_LABEL[slug]}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {blurbs[slug]}
                </p>
                <span className="mt-4 text-sm font-semibold text-[var(--accent)]">
                  Open hints →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
