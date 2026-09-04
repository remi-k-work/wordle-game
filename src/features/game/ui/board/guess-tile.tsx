// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useSonarPing } from "@/features/game/hooks";

// types
import type { Tile } from "@/features/game/domain";

interface GuessTileProps {
  tile: Tile;
  bounceAnim?: boolean;
  isSonarReveal?: boolean;
}

// constants
import { TILE_COLOR_MAP } from "./constants";

export function GuessTile({ tile: { tileKey, color }, bounceAnim = false, isSonarReveal = false }: GuessTileProps) {
  const scope = useSonarPing(isSonarReveal);

  return (
    <div ref={scope} className={cn("@container grid place-items-center border-2", color && TILE_COLOR_MAP[color], bounceAnim && "animate-bounce")}>
      <span className="text-[50cqi] leading-0 font-semibold sm:text-[40cqi]">{tileKey}</span>
    </div>
  );
}

export function GuessTileSkeleton() {
  return (
    <div className="@container grid place-items-center border-2">
      <span className="text-[50cqi] leading-0 font-semibold sm:text-[40cqi]">&nbsp;</span>
    </div>
  );
}
