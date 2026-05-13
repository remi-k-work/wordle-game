// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom } from "@/atoms";

// components
import GuessTile from "./GuessTile";

// types
import type { WordleGrid } from "@/domain";

interface GuessRowProps {
  wordleGrid: WordleGrid;
  rowIndex: number;
}

export default function GuessRow({ wordleGrid, rowIndex }: GuessRowProps) {
  const currentTurn = useAtomValue(currentTurnAtom);
  const isCurrentTurn = rowIndex === currentTurn - 1;

  return (
    <div
      className={cn(
        "grid grid-cols-5 grid-rows-1 gap-4",
        isCurrentTurn && [
          // Reset backgrounds/borders for children before animation fully executes
          "[&>div]:border-primary [&>div]:bg-transparent",
          // Apply staggered animation delays
          "[&>div:nth-child(1)]:animate-flip [&>div:nth-child(1)]:[animation-delay:0s]",
          "[&>div:nth-child(2)]:animate-flip [&>div:nth-child(2)]:[animation-delay:0.2s]",
          "[&>div:nth-child(3)]:animate-flip [&>div:nth-child(3)]:[animation-delay:0.4s]",
          "[&>div:nth-child(4)]:animate-flip [&>div:nth-child(4)]:[animation-delay:0.6s]",
          "[&>div:nth-child(5)]:animate-flip [&>div:nth-child(5)]:[animation-delay:0.8s]",
        ]
      )}
    >
      {wordleGrid[rowIndex].map((tile, tileIndex) => (
        <GuessTile key={tileIndex} tile={tile} />
      ))}
    </div>
  );
}
