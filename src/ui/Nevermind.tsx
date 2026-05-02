import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom } from "../atoms/gameAtom";
import { languageAtom } from "../atoms/languageAtom";

export default function Nevermind() {
  const { theSecretWord } = useAtomValue(gameStateAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="text-[#ff004c] font-bold text-[0.8em] uppercase tracking-[1px] mb-2">
        {theSecretWord}
      </p>
      {language === "en" ? (
        <p>Better luck next time 😄</p>
      ) : (
        <p>Więcej szczęścia następnym razem 😄</p>
      )}
    </article>
  );
}
