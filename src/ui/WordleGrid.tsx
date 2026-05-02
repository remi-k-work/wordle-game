import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom, gridAtom } from "../atoms/gameAtom";
import CurrentGuess from "./CurrentGuess";
import GuessRow from "./GuessRow";

export default function WordleGrid() {
  const { currentTurn } = useAtomValue(gameStateAtom);
  const wordleGrid = useAtomValue(gridAtom);

  return (
    <div className="min-h-full grid gap-4 grid-cols-1 grid-rows-6">
      {wordleGrid.map((_, rowIndex) => {
        return rowIndex === currentTurn ? (
          <CurrentGuess key={rowIndex} />
        ) : (
          <GuessRow key={rowIndex} wordleGrid={wordleGrid} rowIndex={rowIndex} />
        );
      })}
    </div>
  );
}
