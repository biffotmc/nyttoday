import { listAvailableDates } from "@/lib/data";

/** NYT dailies flip at midnight Eastern. */
const PUZZLE_TIMEZONE = "America/New_York";

export function calendarDateInTimeZone(
  timeZone: string,
  instant: Date = new Date(),
): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(instant);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) {
    throw new Error(`calendarDateInTimeZone: missing parts for ${timeZone}`);
  }
  return `${y}-${m}-${d}`;
}

/**
 * Calendar “today” in Eastern Time, using an on-disk bundle for that date if present;
 * otherwise the newest available date not after that day (ignores pre-ingested future puzzles).
 */
export async function getTodayBundleDate(): Promise<string | null> {
  const available = await listAvailableDates();
  if (!available.length) return null;

  const calendarToday = calendarDateInTimeZone(PUZZLE_TIMEZONE);

  const set = new Set(available);
  if (set.has(calendarToday)) return calendarToday;

  const notAfter = available.filter((d) => d <= calendarToday);
  if (notAfter.length) return notAfter[notAfter.length - 1];

  return null;
}
