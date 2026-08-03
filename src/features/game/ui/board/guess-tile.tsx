// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { Tile } from "@/features/game/domain";

interface GuessTileProps {
  tile: Tile;
  bounceAnim?: boolean;
}

// constants
import { COLOR_MAP } from "@/features/game/domain";

export function GuessTile({ tile: { tileKey, color }, bounceAnim = false }: GuessTileProps) {
  return (
    <div className={cn("@container grid place-items-center border-2", color && COLOR_MAP[color], bounceAnim && "animate-bounce")}>
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
