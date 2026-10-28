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

  // The board is a fixed six-row grid: the active row is where the player types,
  // and the row immediately before it is still playing its reveal/flip animation
  const currentGuessRowIndex = currentTurn - 1;
  const flippingRowIndex = currentGuessRowIndex - 1;

  return (
    <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">
      {wordleGrid.map((tiles, rowIndex) => {
        if (rowIndex === currentGuessRowIndex) return <CurrentGuess key={rowIndex} />;

        return <GuessRow key={rowIndex} tiles={tiles} baseTiles={baseWordleGrid[rowIndex]} isFlipping={rowIndex === flippingRowIndex} />;
      })}
    </article>
  );
}

export function MainSkeleton() {
  return <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">{MAIN_SKELETON_ROWS}</article>;
}
