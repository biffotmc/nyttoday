import type { GameSlug } from "./types";

/** Short, plain-language lines for game day headers (all ages). */
export const GAME_DAY_INTRO: Record<GameSlug, string> = {
  connections:
    "Open a hint for each color group, then the name of the group, then each word—one tap at a time.",
  wordle: "Three gentle clues first. When you’re ready, reveal the answer one letter at a time.",
  strands: "Open the spangram one letter at a time. Theme words stay tucked below until you want them.",
  "letter-boxed":
    "The letters sit around the square. When you’re ready, you can show the official solution.",
  "spelling-bee":
    "For each pangram, see a hint, then the word. After that, you can list the rest of the answers.",
};

export const SPOILER_ZONE_NOTE =
  "After this point, you might see answers. Tap or open only what you want.";

export const CONNECTIONS_SOLVE_HELP =
  "Groups run from easiest (yellow) to hardest (purple). Each group: hint, title, then each word.";

export const WORDLE_HINTS_BLURB = "Small clues here—the letters below stay hidden until you tap them.";
