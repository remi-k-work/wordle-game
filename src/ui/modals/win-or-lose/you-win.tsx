// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeTheSecretWordAtom, wordChallengeWordScoreAtom } from "@/features/game/state";

// components
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";
import { RunScore } from "./run-score";
import { SecretWordReveal } from "./secret-word";
import { T, Var } from "gt-next";

export function YouWin() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const wordScore = useAtomValue(wordChallengeWordScoreAtom);

  if (Option.isNone(theSecretWord) || Option.isNone(wordScore)) return null;
  const { timeSeconds } = wordScore.value;

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <T>
        <p>
          You found the solution in{" "}
          <b>
            <Var>{currentTurn - 1}</Var>
          </b>{" "}
          guesses 😄
        </p>
      </T>

      <SecretWordReveal secretWord={theSecretWord.value} />

      <ScoringSimulator guessedTurn={currentTurn - 1} timeElapsed={timeSeconds} />
      <RunScore />
    </article>
  );
}
