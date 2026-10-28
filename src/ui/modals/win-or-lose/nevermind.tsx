// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeTheSecretWordAtom } from "@/features/game/state/word-challenge";
import { T } from "gt-react";

// components
import { RunOutcome } from "./run-outcome";
import { RunScore } from "./run-score";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";

export function Nevermind() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);

  return Option.match(theSecretWord, {
    onNone: () => null,
    onSome: (theSecretWord) => (
      <RunOutcome
        secretWord={theSecretWord}
        message={
          <p>
            <T>Better luck next time 😄</T>
          </p>
        }
      >
        <RunScore />
        <NewHighScore />
      </RunOutcome>
    ),
  });
}
