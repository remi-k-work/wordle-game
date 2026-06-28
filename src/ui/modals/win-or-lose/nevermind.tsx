// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import {
  theSecretWordAtom,
  startNewRunAction,
  runSessionLastRunScoreAtom,
  runSessionLastStreakAtom,
  runSessionBestRunScoreAtom,
  runSessionBestStreakAtom,
} from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { Definition } from "./definition";
import { RunScore } from "./run-score";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";

// assets
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const lastRunScore = useAtomValue(runSessionLastRunScoreAtom);
  const lastStreak = useAtomValue(runSessionLastStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);
  const startNewRun = useAtomSet(startNewRunAction);

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>Better luck next time 😄</p>

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <Definition />

      <RunScore runScore={lastRunScore} bestRunScore={bestRunScore} streak={lastStreak} bestStreak={bestStreak} />
      <NewHighScore />

      <Button tabIndex={-1} className="button mx-auto" onClick={() => startNewRun()}>
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    </article>
  );
}
