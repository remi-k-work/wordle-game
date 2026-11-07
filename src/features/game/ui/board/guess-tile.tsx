// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useSonarPing } from "@/features/game/hooks/use-sonar-ping";

// types
import type { Color } from "@/features/game/domain/models";

// constants
import { TILE_COLOR_MAP } from "./constants";

// Fully static class strings, hoisted so the live tile and its skeleton stay in
// the same shape — and so neither re-runs the base tokens through twMerge on
// every render
const TILE_CLASSES = "@container grid place-items-center border-2";
const LETTER_CLASSES = "text-[50cqi] leading-0 font-semibold sm:text-[40cqi]";

// The letter and its colour, not the whole `Tile` object: the grid atoms hand
// down a freshly allocated row on every board render, so an object prop would
// carry a new identity per tile and this `memo` could never bail out. Spelling
// the two fields out lets the comparison stay value-based — the same reason
// `KeypadKey` takes `letter`/`color` rather than a pool entry (see `KeypadArea`)
interface GuessTileProps {
  tileKey: string;
  color: Color;
  bounceAnim?: boolean;
  isSonarReveal?: boolean;
}

export const GuessTile = memo(function GuessTile({ tileKey, color, bounceAnim = false, isSonarReveal = false }: GuessTileProps) {
  const scope = useSonarPing(isSonarReveal);

  return (
    <div ref={scope} className={cn(TILE_CLASSES, color && TILE_COLOR_MAP[color], bounceAnim && "animate-bounce")}>
      <span className={LETTER_CLASSES}>{tileKey}</span>
    </div>
  );
});

export function GuessTileSkeleton() {
  return (
    <div className={TILE_CLASSES}>
      <span className={LETTER_CLASSES}>&nbsp;</span>
    </div>
  );
}
