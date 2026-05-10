import { latestDate, listAvailableDates } from "@/lib/data";

export async function getLatestBundleDate(): Promise<string | null> {
  const dates = await listAvailableDates();
  return latestDate(dates) ?? null;
}
