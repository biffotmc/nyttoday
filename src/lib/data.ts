import fs from "fs/promises";
import path from "path";
import type { DayBundle, GameSlug } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "days");

export async function listAvailableDates(): Promise<string[]> {
  try {
    const names = await fs.readdir(DATA_DIR);
    return names
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/i, ""))
      .sort();
  } catch {
    return [];
  }
}

export async function loadDay(date: string): Promise<DayBundle | null> {
  const safe = date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : null;
  if (!safe) return null;
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${safe}.json`), "utf8");
    return JSON.parse(raw) as DayBundle;
  } catch {
    return null;
  }
}

export function getGameFromDay(day: DayBundle, slug: GameSlug) {
  switch (slug) {
    case "connections":
      return day.connections;
    case "wordle":
      return day.wordle;
    case "strands":
      return day.strands;
    case "letter-boxed":
      return day["letter-boxed"];
    case "spelling-bee":
      return day["spelling-bee"];
    default:
      return undefined;
  }
}

export function latestDate(dates: string[]): string | undefined {
  return dates.length ? dates[dates.length - 1] : undefined;
}
