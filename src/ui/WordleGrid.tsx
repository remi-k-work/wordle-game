// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom, wordleGridAtom } from "@/atoms";

// components
import CurrentGuess from "./CurrentGuess";
import GuessRow from "./GuessRow";

export default function WordleGrid() {
  const currentTurn = useAtomValue(currentTurnAtom);
  const wordleGrid = useAtomValue(wordleGridAtom);

  return (
    <div className="grid min-h-full grid-cols-1 grid-rows-6 gap-4">
      {wordleGrid.map((_, rowIndex) => {
        return rowIndex === currentTurn ? <CurrentGuess key={rowIndex} /> : <GuessRow key={rowIndex} wordleGrid={wordleGrid} rowIndex={rowIndex} />;
      })}
    </div>
  );
}
