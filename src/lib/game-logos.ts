import type { GameSlug } from "./types";

/** Static PNG paths under `/public/game-logos`. */
export const GAME_LOGO_SRC: Record<GameSlug, string> = {
  connections: "/game-logos/connections.png",
  wordle: "/game-logos/wordle.png",
  strands: "/game-logos/strands.png",
  "letter-boxed": "/game-logos/letter-boxed.png",
  "spelling-bee": "/game-logos/spelling-bee.png",
};
