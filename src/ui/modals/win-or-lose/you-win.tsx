// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeTheSecretWordAtom, wordChallengeWordScoreAtom } from "@/features/game/state";

// components
import { Definition } from "./definition";
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";
import { RunScore } from "./run-score";
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

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord.value}</h2>
      <Definition />

      <ScoringSimulator guessedTurn={currentTurn - 1} timeElapsed={timeSeconds} />
      <RunScore />
    </article>
  );
}
