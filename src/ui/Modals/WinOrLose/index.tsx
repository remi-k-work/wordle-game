// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { activeModalAtom, gameStatusAtom, languageAtom } from "@/atoms";

// components
import { Modal } from "@/ui/Modals";
import { YouWin } from "./YouWin";
import { Nevermind } from "./Nevermind";

export function WinOrLoseModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const gameStatus = useAtomValue(gameStatusAtom);
  const language = useAtomValue(languageAtom);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const isWinner = gameStatus._tag === "Won";

  if (activeModal === "status") {
    return (
      <Modal title={isWinner ? (language === "En" ? "You Win!" : "Wygrałeś!") : language === "En" ? "Nevermind" : "Trudno"}>
        {isWinner ? <YouWin /> : <Nevermind />}
      </Modal>
    );
  }

  return null;
}
