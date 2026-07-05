// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeTheSecretWordAtom } from "@/features/game/state";

// components
import { Definition } from "./definition";
import { RunScore } from "./run-score";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";

export function Nevermind() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);
  if (Option.isNone(theSecretWord)) return null;

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>Better luck next time 😄</p>

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord.value}</h2>
      <Definition />

      <RunScore />
      <NewHighScore />
    </article>
  );
}
