// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeWordleGridAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksWordleGridAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { CurrentGuess } from "./current-guess";
import { GuessRow, GuessRowSkeleton } from "./guess-row";

// constants
const MAIN_SKELETON_ROWS = Array.from({ length: 6 }, (_, index) => <GuessRowSkeleton key={index} />);

export function Main() {
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const baseWordleGrid = useAtomValue(wordChallengeWordleGridAtom);
  const wordleGrid = useAtomValue(overdriveHacksWordleGridAtom);

  return (
    <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">
      {wordleGrid.map((tiles, rowIndex) => {
        if (rowIndex === currentTurn - 1) return <CurrentGuess key={rowIndex} />;

        // The enhanced grid only fills tiles that are empty in the base grid, so
        // every filled base-empty tile in a row is a sonar reveal
        const baseRow = baseWordleGrid[rowIndex];
        const sonarRevealPositions = new Set<number>();
        tiles.forEach((tile, tileIndex) => {
          if (baseRow[tileIndex].tileKey === "" && tile.tileKey !== "") sonarRevealPositions.add(tileIndex);
        });

        return <GuessRow key={rowIndex} tiles={tiles} sonarRevealPositions={sonarRevealPositions} isFlipping={rowIndex === currentTurn - 2} />;
      })}
    </article>
  );
}

export function MainSkeleton() {
  return <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">{MAIN_SKELETON_ROWS}</article>;
}
