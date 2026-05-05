// services, features, and other libraries
import { useEffect } from "react";
import { useAtomValue, useAtomSet, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom, isGameFinishedAtom, isModalOpenAtom, isWinnerAtom, languageAtom, modalTypeAtom, openModalAction } from "./atoms";

// components
import WordleGrid from "./ui/WordleGrid";
import Keypad from "./ui/Keypad";
import Modal from "./ui/Modal";
import YouWin from "./ui/YouWin";
import Nevermind from "./ui/Nevermind";
import ControlPanel from "./ui/ControlPanel";
import LoadingStatus from "./ui/LoadingStatus";
import Help from "./ui/Help";

export default function App() {
  useAtomMount(gameDataSolutionsAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);
  const isGameFinished = useAtomValue(isGameFinishedAtom);
  const isWinner = useAtomValue(isWinnerAtom);
  const isModalOpen = useAtomValue(isModalOpenAtom);
  const modalType = useAtomValue(modalTypeAtom);
  const language = useAtomValue(languageAtom);
  const openModal = useAtomSet(openModalAction);

  // Automatically open status modal when game finishes
  useEffect(() => {
    if (isGameFinished) {
      openModal("status");
    }
  }, [isGameFinished, openModal]);

  return Result.builder(gameDataSolutions)
    .onInitial(() => <LoadingStatus status="pending" />)
    .onWaiting(() => <LoadingStatus status="pending" />)
    .onFailure(() => <LoadingStatus status="rejected" />)
    .onSuccess(() => (
      <>
        <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] gap-4 p-4">
          <header>
            <ControlPanel />
          </header>
          <main>
            <WordleGrid />
          </main>
          <footer>
            <Keypad />
          </footer>
        </div>

        {isModalOpen && modalType === "help" && (
          <Modal title={language === "En" ? "Help" : "Pomoc"}>
            <Help />
          </Modal>
        )}

        {isModalOpen && modalType === "status" && isGameFinished && (
          <Modal title={isWinner ? (language === "En" ? "You Win!" : "Wygrałeś!") : language === "En" ? "Nevermind" : "Trudno"}>
            {isWinner ? <YouWin /> : <Nevermind />}
          </Modal>
        )}
      </>
    ))
    .render();
}
