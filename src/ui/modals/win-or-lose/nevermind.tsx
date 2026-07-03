// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeTheSecretWordAtom } from "@/features/game/state";

// components
import { Definition } from "./definition";
import { RunScore } from "./run-score";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";

export function Nevermind() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);

  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p>Better luck next time 😄</p>

      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <Definition />

      <RunScore />
      <NewHighScore />
    </article>
  );
}
