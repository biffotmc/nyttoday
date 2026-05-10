import { notFound } from "next/navigation";
import { GameDayView } from "@/components/game-day-view";
import { formatDisplayDate } from "@/lib/format-date";
import { getLatestBundleDate } from "@/lib/today";
import { GAME_LABEL, type GameSlug } from "@/lib/types";

export async function TodayGameDayLoader({ slug }: { slug: GameSlug }) {
  const resolved = await getLatestBundleDate();
  if (!resolved) notFound();
  const label = GAME_LABEL[slug];
  const when = formatDisplayDate(resolved);
  return (
    <GameDayView
      slug={slug}
      resolvedDateIso={resolved}
      breadcrumbEndLabel="Today"
      headline={`Today’s ${label}`}
      subheadline={`Puzzle date: ${when}`}
    />
  );
}
