// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentTurnAtom, wordChallengeTheSecretWordAtom, wordChallengeWordScoreAtom } from "@/features/game/state/word-challenge";
import { T, Var } from "gt-react";

// components
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";
import { RunOutcome } from "./run-outcome";
import { RunScore } from "./run-score";

export function YouWin() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);
  const currentTurn = useAtomValue(wordChallengeCurrentTurnAtom);
  const wordScore = useAtomValue(wordChallengeWordScoreAtom);

  return Option.match(Option.all({ theSecretWord, wordScore }), {
    onNone: () => null,
    onSome: ({ theSecretWord, wordScore }) => (
      <RunOutcome
        secretWord={theSecretWord}
        message={
          <T>
            <p>
              You found the solution in{" "}
              <b>
                <Var>{currentTurn - 1}</Var>
              </b>{" "}
              guesses 😄
            </p>
          </T>
        }
      >
        <ScoringSimulator guessedTurn={currentTurn - 1} timeElapsed={wordScore.timeSeconds} />
        <RunScore />
      </RunOutcome>
    ),
  });
}
