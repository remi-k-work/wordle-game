// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { gameStateAtom } from "@/atoms/gameAtom";
import { languageAtom } from "@/atoms/languageAtom";

export default function Nevermind() {
  const { theSecretWord } = useAtomValue(gameStateAtom);
  const language = useAtomValue(languageAtom);

  return (
    <article>
      <p className="mb-2 text-[0.8em] font-bold tracking-[1px] text-[#ff004c] uppercase">{theSecretWord}</p>
      {language === "en" ? <p>Better luck next time 😄</p> : <p>Więcej szczęścia następnym razem 😄</p>}
    </article>
  );
}
