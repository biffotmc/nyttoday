import type { MetadataRoute } from "next";
import { listAvailableDates } from "@/lib/data";
import { gameTodayVanityPath } from "@/lib/game-vanity-paths";
import { calendarDateInTimeZone } from "@/lib/today";
import { getSiteUrl } from "@/lib/site-url";
import { GAME_SLUGS } from "@/lib/types";

/** Refresh sitemap periodically so new ingested days appear without redeploying. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const dates = (await listAvailableDates()).filter(
    (d) => d <= calendarDateInTimeZone("America/New_York"),
  );
  const now = new Date();
  const out: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/games`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
  for (const slug of GAME_SLUGS) {
    out.push({
      url: `${base}/games/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
    out.push({
      url: `${base}${gameTodayVanityPath(slug)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    });
    for (const date of dates) {
      out.push({
        url: `${base}/games/${slug}/${date}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  }
  return out;
}
