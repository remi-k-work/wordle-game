// components
import { GuessTile } from "./guess-tile";

// types
import type { Tile } from "@/features/game/domain/models";

interface CurrentGuessTileProps {
  tile: Tile;
  tileIndex: number;
  currentLength: number;
}

// A single tile in the active guess row:
// - a typed letter when its index is < currentLength
// - a sonar-revealed vowel when its index is >= currentLength and it carries a key
// - empty otherwise
// Only the most recently typed tile bounces; sonar-revealed tiles never bounce
export function CurrentGuessTile({ tile, tileIndex, currentLength }: CurrentGuessTileProps) {
  // Typed letters occupy indices < currentLength; sonar-revealed tiles occupy
  // indices >= currentLength with a non-empty key, so a tile at or past
  // currentLength with a key must be a sonar reveal
  const isSonarReveal = tileIndex >= currentLength && tile.tileKey !== "";

  // Only the most recently typed tile bounces, and never a sonar-revealed tile
  const isLastTypedTile = tile.tileKey !== "" && tileIndex === currentLength - 1;

  return <GuessTile tile={tile} bounceAnim={isLastTypedTile && !isSonarReveal} isSonarReveal={isSonarReveal} />;
}
