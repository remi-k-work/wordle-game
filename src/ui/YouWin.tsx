// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom, languageAtom, theSecretWordAtom } from "@/atoms";

export default function YouWin() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="mb-2 text-[0.8em] font-bold tracking-[1px] text-[#ff004c] uppercase">{theSecretWord}</p>
      {language === "En" ? <p>You found the solution in {currentTurn} guesses 😄</p> : <p>Udało Ci się znaleźć rozwiązanie w {currentTurn} odgadnięciach 😄</p>}
    </article>
  );
}
