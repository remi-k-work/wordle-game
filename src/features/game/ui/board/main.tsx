// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom } from "@/features/game/state";
import { overdriveHacksWordleGridAtom } from "@/features/overdrive-hacks/state";

// components
import { CurrentGuess } from "./current-guess";
import { GuessRow, GuessRowSkeleton } from "./guess-row";

export function Main() {
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const wordleGrid = useAtomValue(overdriveHacksWordleGridAtom);

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
