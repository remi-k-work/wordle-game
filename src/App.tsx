// services, features, and other libraries
import { useEffect } from "react";
import { useAtomValue, useAtomSet, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataAtom, isGameFinishedAtom, isModalOpenAtom, isWinnerAtom, languageAtom, modalTypeAtom, openModalAction } from "./atoms";

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
  useAtomMount(gameDataAtom);
  const gameData = useAtomValue(gameDataAtom);
  const isFinished = useAtomValue(isGameFinishedAtom);
  const isWinner = useAtomValue(isWinnerAtom);
  const isModalOpen = useAtomValue(isModalOpenAtom);
  const modalType = useAtomValue(modalTypeAtom);
  const language = useAtomValue(languageAtom);
  const openModal = useAtomSet(openModalAction);

  // Automatically open status modal when game finishes
  useEffect(() => {
    if (isFinished) {
      openModal("status");
    }
  }, [isFinished, openModal]);

  return Result.builder(gameData)
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
          <Modal title={language === "en" ? "Help" : "Pomoc"}>
            <Help />
          </Modal>
        )}

        {isModalOpen && modalType === "status" && isFinished && (
          <Modal title={isWinner ? (language === "en" ? "You Win!" : "Wygrałeś!") : language === "en" ? "Nevermind" : "Trudno"}>
            {isWinner ? <YouWin /> : <Nevermind />}
          </Modal>
        )}
      </>
    ))
    .render();
}
