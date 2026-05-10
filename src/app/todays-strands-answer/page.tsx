import { TodayGameDayLoader } from "@/components/today-game-day-loader";
import { vanityRouteMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return vanityRouteMetadata("strands");
}

export default async function Page() {
  return <TodayGameDayLoader slug="strands" />;
}
