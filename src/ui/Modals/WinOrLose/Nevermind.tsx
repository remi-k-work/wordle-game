// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { theSecretWordAtom, startNewRunAction, lastRunScoreAtom, lastStreakAtom, bestRunScoreAtom, bestStreakAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { RunScore } from "./RunScore";
import { NewHighScore } from "@/features/high-score/ui/NewHighScore";

// assets
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const lastRunScore = useAtomValue(lastRunScoreAtom);
  const lastStreak = useAtomValue(lastStreakAtom);
  const bestRunScore = useAtomValue(bestRunScoreAtom);
  const bestStreak = useAtomValue(bestStreakAtom);
  const startNewRun = useAtomSet(startNewRunAction);

  return (
    <article className="max-w-prose space-y-4">
      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <p>Better luck next time 😄</p>

      <RunScore runScore={lastRunScore} bestRunScore={bestRunScore} streak={lastStreak} bestStreak={bestStreak} />
      <NewHighScore />

      <Button tabIndex={-1} className="button mx-auto" onClick={() => startNewRun()}>
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    </article>
  );
}
