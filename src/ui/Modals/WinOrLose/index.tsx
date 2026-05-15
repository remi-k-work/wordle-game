// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { activeModalAtom, gameStatusAtom } from "@/atoms";

// components
import { Modal } from "@/ui/Modals";
import { YouWin } from "./YouWin";
import { Nevermind } from "./Nevermind";

export function WinOrLoseModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const gameStatus = useAtomValue(gameStatusAtom);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const isWinner = gameStatus._tag === "Won";

  return (
    <Modal isOpen={activeModal === "status"} title={isWinner ? "You Win!" : "Nevermind"}>
      {isWinner ? <YouWin /> : <Nevermind />}
    </Modal>
  );
}
