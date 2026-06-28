// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import {
  currentTurnAtom,
  theSecretWordAtom,
  wordScoreAtom,
  nextWordAction,
  runSessionRunScoreAtom,
  runSessionStreakAtom,
  runSessionBestRunScoreAtom,
  runSessionBestStreakAtom,
} from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { Definition } from "./definition";
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";
import { RunScore } from "./run-score";

// assets
import { ForwardIcon } from "@heroicons/react/24/outline";

export function YouWin() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const runScore = useAtomValue(runSessionRunScoreAtom);
  const streak = useAtomValue(runSessionStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);
  const wordScoreOption = useAtomValue(wordScoreAtom);
  const nextWord = useAtomSet(nextWordAction);

  if (Option.isNone(wordScoreOption)) return null;

  const { timeSeconds } = wordScoreOption.value;

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>
        You found the solution in <b>{currentTurn - 1}</b> guesses 😄
      </p>

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <Definition />

      <ScoringSimulator guessedTurn={currentTurn - 1} timeElapsed={timeSeconds} />
      <RunScore runScore={runScore} bestRunScore={bestRunScore} streak={streak} bestStreak={bestStreak} />

      <Button tabIndex={-1} className="button mx-auto" onClick={() => nextWord()}>
        <ForwardIcon className="size-11" />
        Next Word
      </Button>
    </article>
  );
}
