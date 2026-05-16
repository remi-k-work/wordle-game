// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { theSecretWordAtom } from "@/atoms";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);

  return (
    <article>
      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <p>Better luck next time 😄</p>
    </article>
  );
}
