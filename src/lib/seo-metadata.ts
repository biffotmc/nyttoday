import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { GAME_LABEL, type GameSlug } from "@/lib/types";
import { formatDisplayDate } from "@/lib/format-date";
import { gameTodayVanityPath } from "@/lib/game-vanity-paths";
import { getLatestBundleDate } from "@/lib/today";

export function datedGameMetadata(slug: GameSlug, dateIso: string): Metadata {
  const label = GAME_LABEL[slug];
  const when = formatDisplayDate(dateIso);
  const path = `/games/${slug}/${dateIso}`;
  const title = `${label} — ${dateIso}`;
  return {
    title,
    description: `Hints and answers for ${label} for ${when}.`,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${title} · nyt.today`,
      description: `Hints and answers for ${label}.`,
      url: absoluteUrl(path),
      siteName: "nyt.today",
      locale: "en_US",
      type: "website",
    },
  };
}

export function todayVanityMetadata(slug: GameSlug, resolvedDateIso: string): Metadata {
  const label = GAME_LABEL[slug];
  const path = gameTodayVanityPath(slug);
  const when = formatDisplayDate(resolvedDateIso);
  const title = `Today’s ${label} — hints & answers`;
  return {
    title,
    description: `Today’s ${label} hints and answers (puzzle for ${when}).`,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${title} · nyt.today`,
      description: `Help for today’s ${label} puzzle.`,
      url: absoluteUrl(path),
      siteName: "nyt.today",
      locale: "en_US",
      type: "website",
    },
  };
}

/** Same HTML as the vanity page; canonical is the vanity URL. */
export function gamesTodayPathMetadata(slug: GameSlug, resolvedDateIso: string): Metadata {
  const base = todayVanityMetadata(slug, resolvedDateIso);
  const path = `/games/${slug}/today`;
  return {
    ...base,
    alternates: { canonical: absoluteUrl(gameTodayVanityPath(slug)) },
    openGraph: {
      ...base.openGraph,
      url: absoluteUrl(path),
    },
  };
}

export function todaysShortPathMetadata(slug: GameSlug, resolvedDateIso: string): Metadata {
  const base = todayVanityMetadata(slug, resolvedDateIso);
  const path = `/todays/${slug}`;
  return {
    ...base,
    alternates: { canonical: absoluteUrl(gameTodayVanityPath(slug)) },
    openGraph: {
      ...base.openGraph,
      url: absoluteUrl(path),
    },
  };
}

async function latestOrEmptyMeta(slug: GameSlug): Promise<Metadata> {
  const resolved = await getLatestBundleDate();
  if (!resolved) return { title: GAME_LABEL[slug] };
  return todayVanityMetadata(slug, resolved);
}

export async function vanityRouteMetadata(slug: GameSlug): Promise<Metadata> {
  return latestOrEmptyMeta(slug);
}

export async function gamesTodayRouteMetadata(slug: GameSlug): Promise<Metadata> {
  const resolved = await getLatestBundleDate();
  if (!resolved) return { title: GAME_LABEL[slug] };
  return gamesTodayPathMetadata(slug, resolved);
}

export async function todaysShortRouteMetadata(slug: GameSlug): Promise<Metadata> {
  const resolved = await getLatestBundleDate();
  if (!resolved) return { title: GAME_LABEL[slug] };
  return todaysShortPathMetadata(slug, resolved);
}
