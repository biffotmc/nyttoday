import Image from "next/image";
import { GAME_LOGO_SRC } from "@/lib/game-logos";
import type { GameSlug } from "@/lib/types";
import { cn } from "@/lib/cn";

export function GameLogo({
  slug,
  className,
}: {
  slug: GameSlug;
  className?: string;
}) {
  return (
    <Image
      src={GAME_LOGO_SRC[slug]}
      alt=""
      width={56}
      height={56}
      unoptimized
      className={cn("h-14 w-14 bg-transparent object-contain", className)}
    />
  );
}
