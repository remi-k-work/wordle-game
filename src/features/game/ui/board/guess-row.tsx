// react
import { useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeWordleGridAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksSonarRevealsAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { GuessTile, GuessTileSkeleton } from "./guess-tile";

// types
import type { WordleGrid } from "@/features/game/domain/models";

interface GuessRowProps {
  wordleGrid: WordleGrid;
  rowIndex: number;
}

// constants
import { FLIP_STAGGER_CLASSES } from "./constants";

export function GuessRow({ wordleGrid, rowIndex }: GuessRowProps) {
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);
  const baseWordleGrid = useAtomValue(wordChallengeWordleGridAtom);
  const isCurrentTurn = rowIndex === currentTurn - 2;

  // O(1) tile lookup: flatten reveal positions once instead of scanning per tile
  const sonarTiles = useMemo(() => new Set(sonarReveals.flatMap((reveal) => reveal.positions)), [sonarReveals]);

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isCurrentTurn && FLIP_STAGGER_CLASSES)}>
      {wordleGrid[rowIndex].map((tile, tileIndex) => {
        const wasEmpty = baseWordleGrid[rowIndex][tileIndex].tileKey === "";
        const isSonarReveal = wasEmpty && tile.tileKey !== "" && sonarTiles.has(tileIndex);
        return <GuessTile key={tileIndex + String(isSonarReveal)} tile={tile} isSonarReveal={isSonarReveal} />;
      })}
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
