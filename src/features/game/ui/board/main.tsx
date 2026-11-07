// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksWordleGridAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { CurrentGuess } from "./current-guess";
import { GuessRow, GuessRowSkeleton } from "./guess-row";

// constants
import { MAX_TURNS } from "@/features/game/domain/constants";

// The board's grid shell, hoisted so the live board and its skeleton cannot drift
// into different row tracks — which would reflow the whole board at the moment
// real content replaces the placeholder rows
const BOARD_CLASSES = "grid min-h-full grid-cols-1 grid-rows-6 gap-1";

// The row count comes from the same constant the wordle-grid schema bounds rows
// with, so a live board and its skeleton can never disagree on how many rows the
// grid holds (six now, and still six if the constant ever moves)
const MAIN_SKELETON_ROWS = Array.from({ length: MAX_TURNS }, (_, index) => <GuessRowSkeleton key={index} />);

export function Main() {
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);

  // The one grid the board renders: the projection already resolved each tile's
  // sonar reveal, so no row (and no component above it) has to read the
  // un-projected grid to diff against
  const wordleGrid = useAtomValue(overdriveHacksWordleGridAtom);

  // The board is a fixed six-row grid: the active row is where the player types,
  // and the row immediately before it is still playing its reveal/flip animation
  const currentGuessRowIndex = currentTurn - 1;
  const flippingRowIndex = currentGuessRowIndex - 1;

  return (
    <article className={BOARD_CLASSES}>
      {wordleGrid.map((tiles, rowIndex) => {
        if (rowIndex === currentGuessRowIndex) return <CurrentGuess key={rowIndex} />;

        return <GuessRow key={rowIndex} tiles={tiles} isFlipping={rowIndex === flippingRowIndex} />;
      })}
    </article>
  );
}

export function MainSkeleton() {
  return <article className={BOARD_CLASSES}>{MAIN_SKELETON_ROWS}</article>;
}
