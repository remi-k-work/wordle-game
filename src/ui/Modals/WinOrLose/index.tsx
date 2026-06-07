// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { activeModalAtom, closeModalAction, gameStatusAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { Modal } from "@/ui/Modals";
import { YouWin } from "./YouWin";
import { Nevermind } from "./Nevermind";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function WinOrLoseModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const gameStatus = useAtomValue(gameStatusAtom);
  const closeModal = useAtomSet(closeModalAction);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const isWinner = gameStatus._tag === "Won";

  return (
    <Modal isOpen={activeModal === "status"} title={isWinner ? "You Win" : "Run Over"}>
      {isWinner ? <YouWin /> : <Nevermind />}

      <Button tabIndex={-1} className="button mx-auto mt-4 bg-secondary" onClick={() => closeModal()}>
        <XCircleIcon className="size-11" />
        Maybe Later
      </Button>
    </Modal>
  );
}
