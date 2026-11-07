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

  // Early return: without both a secret word and a word score there is no outcome to report
  if (Option.isNone(theSecretWord) || Option.isNone(wordScore)) return null;

  // Named once: the same number is both the guess count the copy prints and the turn the report's score is derived from
  const guessedTurn = currentTurn - 1;

  return (
    <RunOutcome
      secretWord={theSecretWord.value}
      message={
        <T>
          <p>
            You found the solution in{" "}
            <b>
              <Var>{guessedTurn}</Var>
            </b>{" "}
            guesses 😄
          </p>
        </T>
      }
    >
      <ScoringSimulator mode="report" guessedTurn={guessedTurn} timeElapsed={wordScore.value.timeSeconds} />
      <RunScore />
    </RunOutcome>
  );
}
