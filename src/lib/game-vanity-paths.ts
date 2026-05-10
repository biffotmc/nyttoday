import type { GameSlug } from "./types";

/** Primary, stable “today” URL per game for sharing and SEO (stays in the address bar; no redirect). */
export const GAME_TODAY_VANITY_PATH: Record<GameSlug, `/${string}`> = {
  connections: "/todays-connections-answer",
  wordle: "/todays-wordle-answer",
  strands: "/todays-strands-answer",
  "letter-boxed": "/todays-letter-boxed-answer",
  "spelling-bee": "/todays-spelling-bee-answer",
};

export function gameTodayVanityPath(slug: GameSlug): string {
  return GAME_TODAY_VANITY_PATH[slug];
}
