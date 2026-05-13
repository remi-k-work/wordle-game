// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom, theSecretWordAtom } from "@/atoms";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="text-4xl text-destructive uppercase">{theSecretWord}</p>
      {language === "En" ? <p>Better luck next time 😄</p> : <p>Więcej szczęścia następnym razem 😄</p>}
    </article>
  );
}
