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
  grey: "[--_background:var(--color-gray-700)] [--_border-color:var(--color-gray-700)] bg-(--_background) border-(--_border-color)",
  green: "[--_background:var(--color-green-700)] [--_border-color:var(--color-green-700)] bg-(--_background) border-(--_border-color)",
  yellow: "[--_background:var(--color-yellow-700)] [--_border-color:var(--color-yellow-700)] bg-(--_background) border-(--_border-color)",
  red: "[--_background:var(--color-destructive)] [--_border-color:var(--color-destructive)] bg-(--_background) border-(--_border-color)",
  "": "[--_background:transparent] [--_border-color:var(--color-primary)] bg-(--_background) border-(--_border-color)",
} as const satisfies Record<Color, string>;

export default function GuessTile({ tile: { tileKey, color }, bounceAnim = false }: GuessTileProps) {
  return (
    <div className={cn("flex items-center justify-center border-2 [container:tile/size]", color && COLOR_MAP[color], bounceAnim && "animate-bounce")}>
      <span className="text-[90cqb]">{tileKey}</span>
    </div>
  );
}
