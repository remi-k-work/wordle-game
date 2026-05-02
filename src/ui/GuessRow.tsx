import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom } from "../atoms/gameAtom";
import { Tile } from "../domain/models";
import GuessTile from "./GuessTile";

interface GuessRowProps {
  wordleGrid: readonly (readonly Tile[])[];
  rowIndex: number;
}

export default function GuessRow({ wordleGrid, rowIndex }: GuessRowProps) {
  const { currentTurn } = useAtomValue(gameStateAtom);
  const isPreviousTurn = rowIndex === currentTurn - 1;

  return (
    <div className="grid gap-4 grid-cols-5 grid-rows-1">
      {wordleGrid[rowIndex].map((guessTile, tileIndex) => {
        const delay = isPreviousTurn ? `${tileIndex * 0.2}s` : "0s";
        return (
          <div
            key={tileIndex}
            className={isPreviousTurn ? "animate-flip" : ""}
            style={{ animationDelay: delay }}
          >
            <GuessTile {...guessTile} />
          </div>
        );
      })}
    </div>
  );
}
