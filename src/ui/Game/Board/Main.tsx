// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom, wordleGridAtom } from "@/atoms";

// components
import CurrentGuess from "./CurrentGuess";
import GuessRow from "./GuessRow";

export function Main() {
  const currentTurn = useAtomValue(currentTurnAtom);
  const wordleGrid = useAtomValue(wordleGridAtom);

  return (
    <article className="grid min-h-full grid-cols-1 grid-rows-6 gap-2">
      {wordleGrid.map((_, rowIndex) =>
        rowIndex === currentTurn - 1 ? <CurrentGuess key={rowIndex} /> : <GuessRow key={rowIndex} wordleGrid={wordleGrid} rowIndex={rowIndex} />
      )}
    </article>
  );
}
