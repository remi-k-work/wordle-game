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
  const hasWon = wordChallengeMachineSnapshot.matches("wordWon");

  return (
    <Modal isOpen={modalMachineSnapshot.matches("status")} title={hasWon ? "You Win" : "Run Over"}>
      {hasWon ? <YouWin /> : <Nevermind />}

      <section className="mx-auto mt-6 flex max-w-prose flex-wrap items-center justify-around gap-4">
        <GameFlowButton tabIndex={-1} />
        <Button tabIndex={-1} className="button bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
          <XCircleIcon className="size-11" />
          Maybe Later
        </Button>
      </section>
    </Modal>
  );
}
