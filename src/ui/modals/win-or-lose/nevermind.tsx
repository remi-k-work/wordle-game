// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeTheSecretWordAtom } from "@/features/game/state";

// components
import { RunScore } from "./run-score";
import { SecretWordReveal } from "./secret-word";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";
import { T } from "gt-next";

export function Nevermind() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);
  if (Option.isNone(theSecretWord)) return null;

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>
        <T>Better luck next time 😄</T>
      </p>

      <SecretWordReveal secretWord={theSecretWord.value} />

      <RunScore />
      <NewHighScore />
    </article>
  );
}
