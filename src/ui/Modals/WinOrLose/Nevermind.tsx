// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { theSecretWordAtom } from "@/atoms";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);

  return (
    <article>
      <p className="text-4xl text-destructive uppercase">{theSecretWord}</p>
      <p>Better luck next time 😄</p>
    </article>
  );
}
