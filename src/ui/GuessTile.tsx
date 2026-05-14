// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { Color, Tile } from "@/domain";

interface GuessTileProps {
  tile: Tile;
  bounceAnim?: boolean;
}

// constants
const COLOR_MAP = {
  grey: "[--_background:var(--color-tile-grey)] bg-(--_background)",
  yellow: "[--_background:var(--color-tile-yellow)] bg-(--_background)",
  green: "[--_background:var(--color-tile-green)] bg-(--_background)",
  red: "[--_background:var(--color-destructive)] bg-(--_background)",
  "": "[--_background:transparent] bg-(--_background)",
} as const satisfies Record<Color, string>;

export default function GuessTile({ tile: { tileKey, color }, bounceAnim = false }: GuessTileProps) {
  return (
    <div className={cn("flex items-center justify-center border-2 text-5xl font-semibold", color && COLOR_MAP[color], bounceAnim && "animate-bounce")}>
      {tileKey}
    </div>
  );
}
