// react
import { memo } from "react";

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

// Memoized row: completed rows rarely change, so bail out of re-rendering the
// whole 5-tile subtree when `Main` re-renders due to turn/sonar/typing events
// elsewhere on the board; `GuessTile` is also memoized, so this gives each row
// two independent bail-out points
export const GuessRow = memo(function GuessRow({ tiles, baseTiles, isFlipping }: GuessRowProps) {
  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isFlipping && FLIP_STAGGER_CLASSES)}>
      {tiles.map((tile, tileIndex) => {
        // A tile is a sonar reveal when the base grid has no letter at this
        // position but the (hacked) grid does — i.e. the reveal came from sonar,
        // not from the player's own typing
        const isSonarReveal = baseTiles[tileIndex].tileKey === "" && tile.tileKey !== "";

        // Stable per-position keys: useSonarPing already starts/stops the glow
        // from the `isSonarReveal` prop (effect + cleanup), so keying on it too
        // only remounted the tile DOM on every reveal flip
        return <GuessTile key={tileIndex} tile={tile} isSonarReveal={isSonarReveal} />;
      })}
    </div>
  );
});

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
