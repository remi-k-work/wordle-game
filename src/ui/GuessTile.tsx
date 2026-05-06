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
  grey: "[--_background:#a1a1a1] [--_border-color:#a1a1a1] bg-(--_background) border-(--_border-color)",
  green: "[--_background:#5ac85a] [--_border-color:#5ac85a] bg-(--_background) border-(--_border-color)",
  yellow: "[--_background:#e2cc68] [--_border-color:#e2cc68] bg-(--_background) border-(--_border-color)",
  "": "[--_background:transparent] [--_border-color:#666] bg-(--_background) border-(--_border-color)",
} as const satisfies Record<Color, string>;

export default function GuessTile({ tile: { tileKey, color }, bounceAnim = false }: GuessTileProps) {
  return (
    <div
      className={cn("flex items-center justify-center border-2 border-[#666] [container:tile/size]", color && COLOR_MAP[color], bounceAnim && "animate-bounce")}
    >
      <span className="text-[80cqb]">{tileKey}</span>
    </div>
  );
}
