import Link from "next/link";
import { notFound } from "next/navigation";
import { ConnectionsColorGuide } from "@/components/connections-color-guide";
import { ConnectionsReveal } from "@/components/game/connections-reveal";
import { LetterBoxedSection } from "@/components/game/letter-boxed-section";
import { SpellingBeeReveal } from "@/components/game/spelling-bee-reveal";
import { StrandsClueAndSpangram } from "@/components/game/strands-clue-and-spangram";
import { WordleRevealFlow } from "@/components/game/wordle-reveal-flow";
import { SpoilerPanel } from "@/components/spoiler-panel";
import { getGameFromDay, loadDay } from "@/lib/data";
import { GAME_LABEL, GAME_SLUGS, type GameSlug } from "@/lib/types";
import {
  CONNECTIONS_SOLVE_HELP,
  GAME_DAY_INTRO,
  SPOILER_ZONE_NOTE,
} from "@/lib/ui-copy";

export async function GameDayView({
  slug,
  resolvedDateIso,
  breadcrumbEndLabel,
  headline,
  subheadline,
}: {
  slug: GameSlug;
  resolvedDateIso: string;
  breadcrumbEndLabel: string;
  headline: string;
  subheadline?: string;
}) {
  if (!GAME_SLUGS.includes(slug)) notFound();

  const day = await loadDay(resolvedDateIso);
  if (!day) notFound();

  const game = getGameFromDay(day, slug);
  if (!game) notFound();

  const label = GAME_LABEL[slug];

  const connectionsLegacyHints =
    slug === "connections" && "groups" in game
      ? game.hints?.slice(0, game.groups.length).map((h) => h.body) || []
      : [];

  const connectionsGroupHints =
    slug === "connections" && "groups" in game
      ? game.groupHints?.length
        ? game.groupHints
        : connectionsLegacyHints
      : [];

  return (
    <article className="pb-16">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/games" className="hover:text-[var(--accent)]">
          Archive
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/games/${slug}`} className="hover:text-[var(--accent)]">
          {label}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{breadcrumbEndLabel}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          {label}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {headline}
        </h1>
        {subheadline ? (
          <p className="mt-2 text-sm text-[var(--muted)]">{subheadline}</p>
        ) : null}
        <p className="mt-4 text-[var(--muted)]">{GAME_DAY_INTRO[slug]}</p>
      </header>

      <div
        className="mt-8 rounded-2xl border border-[var(--warn-border)] bg-[var(--warn-bg)] px-5 py-4 text-sm leading-relaxed text-[var(--foreground)]"
        role="note"
      >
        <strong className="font-semibold">Heads up.</strong> {SPOILER_ZONE_NOTE}
      </div>

      {"fetchNote" in game && game.fetchNote ? (
        <div
          className="mt-8 rounded-2xl border border-[var(--warn-border)] bg-[var(--warn-bg)] px-5 py-4 text-sm leading-relaxed text-[var(--foreground)]"
          role="note"
        >
          {game.fetchNote}
        </div>
      ) : null}

      {slug === "connections" && "groups" in game && (
        <section className="mt-10 max-w-3xl space-y-8">
          <ConnectionsColorGuide />
          <div>
            <h2 className="font-serif text-2xl font-semibold">Solve by group</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{CONNECTIONS_SOLVE_HELP}</p>
            <div className="mt-6">
              <ConnectionsReveal groups={game.groups} groupHints={connectionsGroupHints} />
            </div>
          </div>
        </section>
      )}

      {slug === "wordle" && "solution" in game && (
        <section className="mt-10 max-w-3xl">
          <h2 className="font-serif text-2xl font-semibold">Wordle</h2>
          <div className="mt-6">
            <WordleRevealFlow hints={game.hints ?? []} solution={game.solution} />
          </div>
        </section>
      )}

      {slug === "strands" && "themeWords" in game && (
        <section className="mt-10 max-w-3xl space-y-8">
          <StrandsClueAndSpangram
            key={resolvedDateIso}
            clue={game.clue}
            startingBoard={game.startingBoard}
            spangram={game.spangram}
          />

          <div>
            <h2 className="font-serif text-2xl font-semibold">Theme words</h2>
            <div className="mt-4">
              <SpoilerPanel title="Show all theme words" eyebrow="Strands">
                <ul className="flex flex-wrap gap-2">
                  {game.themeWords.map((w) => (
                    <li
                      key={w}
                      className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm font-medium ring-1 ring-[var(--border)]"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </SpoilerPanel>
            </div>
          </div>
        </section>
      )}

      {slug === "letter-boxed" && "sides" in game && (
        <section className="mt-10 max-w-3xl">
          <LetterBoxedSection
            key={resolvedDateIso}
            sides={game.sides}
            par={game.par}
            words={game.ourSolution || []}
          />
        </section>
      )}

      {slug === "spelling-bee" && "answers" in game && (
        <section className="mt-10 max-w-3xl">
          <h2 className="font-serif text-2xl font-semibold">Spelling Bee</h2>
          {game.fetchNote && (
            <div className="mt-4 rounded-xl border border-[var(--warn-border)] bg-[var(--warn-bg)] px-4 py-3 text-sm">
              {game.fetchNote}
            </div>
          )}
          <div className="mt-6">
            <SpellingBeeReveal
              pangramHints={game.pangramHints || []}
              pangrams={game.pangrams}
              allAnswers={game.answers}
            />
          </div>
        </section>
      )}
    </article>
  );
}
