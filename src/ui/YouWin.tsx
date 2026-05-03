// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom } from "@/atoms/gameAtom";
import { languageAtom } from "@/atoms/languageAtom";

export default function YouWin() {
  const { theSecretWord, currentTurn } = useAtomValue(gameStateAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="mb-2 text-[0.8em] font-bold tracking-[1px] text-[#ff004c] uppercase">{theSecretWord}</p>
      {language === "en" ? <p>You found the solution in {currentTurn} guesses 😄</p> : <p>Udało Ci się znaleźć rozwiązanie w {currentTurn} odgadnięciach 😄</p>}
    </article>
  );
}
