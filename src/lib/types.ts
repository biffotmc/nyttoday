/** One calendar day of NYT-style games + progressive hints. Written by scripts/ingest.mjs */

/** Games with a public `/games/[slug]` page. Mini may still exist in `DayBundle` from ingest but is hidden from the site. */
export type GameSlug =
  | "connections"
  | "wordle"
  | "strands"
  | "letter-boxed"
  | "spelling-bee";

export interface ProgressiveStep {
  /** 1 = gentlest */
  level: number;
  /** Always empty in new ingest; not shown in UI */
  title?: string;
  body: string;
}

export interface ConnectionsDay {
  puzzleId?: number;
  editor?: string;
  groups: Array<{ title: string; words: string[] }>;
  /** One AI hint per group, same order as `groups` (maps to yellow → purple) */
  groupHints?: string[];
  /** @deprecated use groupHints + per-group UI */
  hints?: ProgressiveStep[];
  /** Set when NYT JSON could not be loaded for this date */
  fetchNote?: string;
}

export interface WordleDay {
  puzzleId?: number;
  editor?: string;
  solution: string;
  hints: ProgressiveStep[];
  fetchNote?: string;
}

export interface MiniClueEntry {
  id: string;
  label?: string;
  direction: "Across" | "Down";
  text: string;
  answer: string;
}

export interface MiniDay {
  puzzleId?: number;
  title?: string;
  rows: string[];
  clues: MiniClueEntry[];
  hints: ProgressiveStep[];
  fetchNote?: string;
}

export interface StrandsDay {
  puzzleId?: number;
  editor?: string;
  clue: string;
  spangram: string;
  themeWords: string[];
  startingBoard?: string[];
  hints?: ProgressiveStep[];
  fetchNote?: string;
}

export interface LetterBoxedDay {
  puzzleId?: number;
  sides: [string, string, string, string];
  par?: number;
  /** Official solution words from puzzle JSON when present */
  ourSolution?: string[];
  hints?: ProgressiveStep[];
  fetchNote?: string;
}

export interface SpellingBeePangramHint {
  word: string;
  hint: string;
}

export interface SpellingBeeDay {
  puzzleId?: number;
  centerLetter: string;
  outerLetters: string;
  pangrams: string[];
  answers: string[];
  /** Hint then word per pangram (ingest aligns to `pangrams`) */
  pangramHints?: SpellingBeePangramHint[];
  hints?: ProgressiveStep[];
  /** Set when NYT Spelling Bee JSON could not be loaded */
  fetchNote?: string;
}

export interface DayBundle {
  date: string;
  fetchedAt?: string;
  connections?: ConnectionsDay;
  wordle?: WordleDay;
  mini?: MiniDay;
  strands?: StrandsDay;
  "letter-boxed"?: LetterBoxedDay;
  "spelling-bee"?: SpellingBeeDay;
}

export const GAME_SLUGS: GameSlug[] = [
  "connections",
  "wordle",
  "strands",
  "letter-boxed",
  "spelling-bee",
];

export const GAME_LABEL: Record<GameSlug, string> = {
  connections: "Connections",
  wordle: "Wordle",
  strands: "Strands",
  "letter-boxed": "Letter Boxed",
  "spelling-bee": "Spelling Bee",
};
