// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { currentTurnAtom, wordleGridAtom } from "@/features/game/state";

// components
import { CurrentGuess } from "./CurrentGuess";
import { GuessRow, GuessRowSkeleton } from "./GuessRow";

export function Main() {
  const currentTurn = useAtomValue(currentTurnAtom);
  const wordleGrid = useAtomValue(wordleGridAtom);

  return (
    <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">
      {wordleGrid.map((_, rowIndex) =>
        rowIndex === currentTurn - 1 ? <CurrentGuess key={rowIndex} /> : <GuessRow key={rowIndex} wordleGrid={wordleGrid} rowIndex={rowIndex} />
      )}
    </article>
  );
}

export function MainSkeleton() {
  return (
    <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-1">
      <GuessRowSkeleton />
      <GuessRowSkeleton />
      <GuessRowSkeleton />
      <GuessRowSkeleton />
      <GuessRowSkeleton />
      <GuessRowSkeleton />
    </article>
  );
}
