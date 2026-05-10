import { notFound } from "next/navigation";
import { TodayGameDayLoader } from "@/components/today-game-day-loader";
import { todaysShortRouteMetadata } from "@/lib/seo-metadata";
import { GAME_SLUGS, type GameSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) return { title: "Puzzle" };
  return todaysShortRouteMetadata(slug as GameSlug);
}

export default async function TodaysShortPage({ params }: Props) {
  const { slug } = await params;
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound();
  return <TodayGameDayLoader slug={slug as GameSlug} />;
}
