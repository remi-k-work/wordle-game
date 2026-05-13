// services, features, and other libraries
import { useAtom, useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentTurnAtom, languageAtom, openModalAction, restartGameAction } from "@/atoms";

// components
import { Button } from "@base-ui/react/button";

// assets
import { CogIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const currentTurn = useAtomValue(currentTurnAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const restartGame = useAtomSet(restartGameAction);
  const openModal = useAtomSet(openModalAction);

  // Handle language change
  function handleLanguageChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    const newLanguage = ev.target.value as "En" | "Pl";
    setLanguage(newLanguage);
    restartGame();
  }

  return (
    <header className="flex items-center justify-evenly gap-4">
      <div className="flex items-center justify-center gap-2 rounded-md border px-2 py-1 text-2xl">
        <CogIcon className="size-9" />
        {currentTurn}
      </div>
      <label className="block">
        {language === "En" ? (
          <>
            <small className="block">Language</small>
            <select name="language" className="cursor-pointer border-none bg-transparent text-white" value={language} onChange={handleLanguageChange}>
              <option value="En" className="bg-[#1b1523]">
                English
              </option>
              <option value="Pl" className="bg-[#1b1523]">
                Polish
              </option>
            </select>
          </>
        ) : (
          <>
            <small className="block">Język</small>
            <select name="language" className="cursor-pointer border-none bg-transparent text-white" value={language} onChange={handleLanguageChange}>
              <option value="En" className="bg-[#1b1523]">
                Angielski
              </option>
              <option value="Pl" className="bg-[#1b1523]">
                Polski
              </option>
            </select>
          </>
        )}
      </label>
      {language === "En" ? (
        <Button className="button" onClick={() => restartGame()}>
          New Game
        </Button>
      ) : (
        <Button className="button" onClick={() => restartGame()}>
          Nowa Gra
        </Button>
      )}
      <Button className="button p-1" onClick={() => openModal("help")}>
        <QuestionMarkCircleIcon className="size-9" />
      </Button>
    </header>
  );
}
