import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom } from "../atoms/gameAtom";
import { languageAtom } from "../atoms/languageAtom";

export default function YouWin() {
  const { theSecretWord, currentTurn } = useAtomValue(gameStateAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="text-[#ff004c] font-bold text-[0.8em] uppercase tracking-[1px] mb-2">
        {theSecretWord}
      </p>
      {language === "en" ? (
        <p>You found the solution in {currentTurn} guesses 😄</p>
      ) : (
        <p>Udało Ci się znaleźć rozwiązanie w {currentTurn} odgadnięciach 😄</p>
      )}
    </article>
  );
}
