import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAME_LABEL, GAME_SLUGS, type GameSlug } from "@/lib/types";
import { listAvailableDates } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";
import { gameTodayVanityPath } from "@/lib/game-vanity-paths";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) return { title: "Game" };
  const label = GAME_LABEL[slug as GameSlug];
  return {
    title: `${label} archive`,
    description: `Browse every ${label} day we’ve published—hints first, answers when you want them.`,
    alternates: { canonical: absoluteUrl(`/games/${slug}`) },
    openGraph: {
      title: `${label} archive · nyt.today`,
      url: absoluteUrl(`/games/${slug}`),
      description: `All ${label} puzzle dates in one place.`,
    },
  };
}

export default async function GameHubPage({ params }: Props) {
  const { slug } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound();

  const label = GAME_LABEL[slug as GameSlug];
  const dates = await listAvailableDates();
  const sorted = [...dates].reverse();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/games" className="font-medium text-[var(--accent)] hover:underline">
            Archive
          </Link>
          <span className="mx-2 text-[var(--border)]">/</span>
          <span className="text-[var(--foreground)]">{label}</span>
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{label}</h1>
        <p className="mt-3 max-w-lg leading-relaxed text-[var(--muted)]">
          Open{" "}
          <Link
            href={gameTodayVanityPath(slug as GameSlug)}
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            today’s puzzle
          </Link>{" "}
          for this game, or choose another day.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          No puzzle files here yet. When puzzles are added to this site, the dates will
          show up in this list.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((d) => (
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
      )}
    </div>
  );
}
