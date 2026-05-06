// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { isGameFinishedAtom, activeModalAtom, isWinnerAtom, languageAtom, openModalAction } from "@/atoms";

// components
import Modal from "./Modal";
import YouWin from "./YouWin";
import Nevermind from "./Nevermind";

export default function WinOrLoseModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const isGameFinished = useAtomValue(isGameFinishedAtom);
  const isWinner = useAtomValue(isWinnerAtom);
  const language = useAtomValue(languageAtom);
  const openModal = useAtomSet(openModalAction);

  // Automatically open status modal when game finishes
  useEffect(() => {
    if (isGameFinished) {
      openModal("status");
    }
  }, [isGameFinished, openModal]);

  if (activeModal === "status" && isGameFinished) {
    return (
      <Modal title={isWinner ? (language === "En" ? "You Win!" : "Wygrałeś!") : language === "En" ? "Nevermind" : "Trudno"}>
        {isWinner ? <YouWin /> : <Nevermind />}
      </Modal>
    );
  }

  return null;
}
