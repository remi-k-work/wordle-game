// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeTheSecretWordAtom, wordChallengeWordScoreAtom } from "@/features/game/state";

// components
import { Definition } from "./definition";
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";
import { RunScore } from "./run-score";

export function YouWin() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const wordScore = useAtomValue(wordChallengeWordScoreAtom);

  if (Option.isNone(wordScore)) return null;
  const { timeSeconds } = wordScore.value;

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>
        You found the solution in <b>{currentTurn - 1}</b> guesses 😄
      </p>

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <Definition />

      <ScoringSimulator guessedTurn={currentTurn - 1} timeElapsed={timeSeconds} />
      <RunScore />
    </article>
  );
}
