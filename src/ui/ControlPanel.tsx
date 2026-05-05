// services, features, and other libraries
import { useAtom, useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentTurnAtom, languageAtom, openModalAction, restartGameAction } from "@/atoms";

// assets
import turns from "@/assets/turns.svg";
import help from "@/assets/help.svg";

export default function ControlPanel() {
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

  // Handle a new game click
  function handleNewGameClick() {
    restartGame();
  }

  // Handle a help click
  function handleHelpClick() {
    openModal("help");
  }

  return (
    <section className="flex items-center justify-evenly gap-4">
      <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-none px-2 py-1">
        <img src={turns} className="w-6" alt="" />
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
        <button type="button" onClick={handleNewGameClick}>
          New Game
        </button>
      ) : (
        <button type="button" onClick={handleNewGameClick}>
          Nowa Gra
        </button>
      )}
      <button type="button" onClick={handleHelpClick}>
        <img src={help} className="w-6" alt="" />
      </button>
    </section>
  );
}
