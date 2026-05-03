import { useAtom, useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { gameStateAtom, restartGameAction } from "@/atoms/gameAtom";
import { languageAtom } from "@/atoms/languageAtom";
import { openModalAction } from "@/atoms/modalAtom";

// assets
import turns from "@/assets/turns.svg";
import help from "@/assets/help.svg";

export default function ControlPanel() {
  const { currentTurn } = useAtomValue(gameStateAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const restartGame = useAtomSet(restartGameAction);
  const openModal = useAtomSet(openModalAction);

  // Handle language change
  function handleLanguageChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    const newLanguage = ev.target.value as "en" | "pl";
    setLanguage(newLanguage);
    restartGame(undefined);
  }

  // Handle a new game click
  function handleNewGameClick() {
    restartGame(undefined);
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
        {language === "en" ? (
          <>
            <small className="block">Language</small>
            <select name="language" className="cursor-pointer border-none bg-transparent text-white" value={language} onChange={handleLanguageChange}>
              <option value={"en"} className="bg-[#1b1523]">
                English
              </option>
              <option value={"pl"} className="bg-[#1b1523]">
                Polish
              </option>
            </select>
          </>
        ) : (
          <>
            <small className="block">Język</small>
            <select name="language" className="cursor-pointer border-none bg-transparent text-white" value={language} onChange={handleLanguageChange}>
              <option value={"en"} className="bg-[#1b1523]">
                Angielski
              </option>
              <option value={"pl"} className="bg-[#1b1523]">
                Polski
              </option>
            </select>
          </>
        )}
      </label>
      {language === "en" ? (
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
