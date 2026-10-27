// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { GuessTile, GuessTileSkeleton } from "./guess-tile";

// types
import type { Tile } from "@/features/game/domain/models";

interface GuessRowProps {
  tiles: readonly Tile[];
  baseTiles: readonly Tile[];
  isFlipping: boolean;
}

// constants
import { FLIP_STAGGER_CLASSES } from "./constants";

export function GuessRow({ tiles, baseTiles, isFlipping }: GuessRowProps) {
  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isFlipping && FLIP_STAGGER_CLASSES)}>
      {tiles.map((tile, tileIndex) => (
        // Stable per-position keys: useSonarPing already starts/stops the glow
        // from the `isSonarReveal` prop (effect + cleanup), so keying on it too
        // only remounted the tile DOM on every reveal flip
        <GuessTile key={tileIndex} tile={tile} isSonarReveal={baseTiles[tileIndex].tileKey === "" && tile.tileKey !== ""} />
      ))}
    </div>
  );
}

export function GuessRowSkeleton() {
  return (
    <div className="grid grid-cols-5 grid-rows-1 gap-1">
      <GuessTileSkeleton />
      <GuessTileSkeleton />
      <GuessTileSkeleton />
      <GuessTileSkeleton />
      <GuessTileSkeleton />
    </div>
  );
}
