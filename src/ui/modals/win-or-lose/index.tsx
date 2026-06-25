// services, features, and other libraries
import { useAtom, useAtomValue } from "@effect/atom-react";
import { gameStatusAtom, modalMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { Modal } from "@/ui/modals";
import { YouWin } from "./you-win";
import { Nevermind } from "./nevermind";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function WinOrLoseModal() {
  const [modalMachineSnapshot, modalMachineEvent] = useAtom(modalMachineAtom);
  const gameStatus = useAtomValue(gameStatusAtom);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const isWinner = gameStatus._tag === "Won";

  return (
    <Modal isOpen={modalMachineSnapshot.matches("status")} title={isWinner ? "You Win" : "Run Over"}>
      {isWinner ? <YouWin /> : <Nevermind />}

      <Button tabIndex={-1} className="button mx-auto mt-4 bg-secondary" onClick={() => modalMachineEvent({ type: "modal.closed" })}>
        <XCircleIcon className="size-11" />
        Maybe Later
      </Button>
    </Modal>
  );
}
