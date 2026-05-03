// types
import type { Color } from "@/domain/models";

interface GuessTileProps {
  tileKey: string;
  color: Color;
  bounceAnim?: boolean;
}

export default function GuessTile({ tileKey, color, bounceAnim = false }: GuessTileProps) {
  const colorClasses = {
    grey: "bg-[#a1a1a1] border-[#a1a1a1] [--_background:#a1a1a1] [--_border-color:#a1a1a1]",
    green: "bg-[#5ac85a] border-[#5ac85a] [--_background:#5ac85a] [--_border-color:#5ac85a]",
    yellow: "bg-[#e2cc68] border-[#e2cc68] [--_background:#e2cc68] [--_border-color:#e2cc68]",
    "": "bg-transparent border-[#666]",
  };

  return (
    <div
      className={`flex h-full w-full items-center justify-center border-2 ${colorClasses[color]} ${bounceAnim ? "animate-bounce" : ""}`}
      style={{ containerType: "size" }}
    >
      <div className="text-[80cqb] font-bold uppercase">{tileKey}</div>
    </div>
  );
}
