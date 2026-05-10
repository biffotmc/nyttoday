import { notFound } from "next/navigation";
import { FuturePuzzleGate } from "@/components/future-puzzle-gate";
import { GameDayView } from "@/components/game-day-view";
import { formatDisplayDate } from "@/lib/format-date";
import { datedGameMetadata } from "@/lib/seo-metadata";
import { GAME_SLUGS, type GameSlug } from "@/lib/types";

type Props = { params: Promise<{ slug: string; date: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, date } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) return { title: "Puzzle" };
  return datedGameMetadata(slug as GameSlug, date);
}

export default async function GameDayPage({ params }: Props) {
  const { slug, date } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound();

  return (
    <FuturePuzzleGate slug={slug as GameSlug} dateIso={date}>
      <GameDayView
        slug={slug as GameSlug}
        resolvedDateIso={date}
        breadcrumbEndLabel={date}
        headline={formatDisplayDate(date)}
      />
    </FuturePuzzleGate>
  );
}
