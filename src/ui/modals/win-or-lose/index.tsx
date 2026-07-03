// services, features, and other libraries
import { useAtom, useAtomValue } from "@effect/atom-react";
import { modalMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";
import { Modal } from "@/ui/modals";
import { YouWin } from "./you-win";
import { Nevermind } from "./nevermind";
import { GameFlowButton } from "@/features/game/ui/flow-button";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function WinOrLoseModal() {
  const [modalMachineSnapshot, modalMachineEvent] = useAtom(modalMachineAtom);
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const hasWon = wordChallengeMachineSnapshot.matches("won");

  return (
    <Modal isOpen={modalMachineSnapshot.matches("status")} title={hasWon ? "You Win" : "Run Over"}>
      {hasWon ? <YouWin /> : <Nevermind />}

      <GameFlowButton tabIndex={-1} />
      <Button tabIndex={-1} className="button mx-auto mt-4 bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
        <XCircleIcon className="size-11" />
        Maybe Later
      </Button>
    </Modal>
  );
}
