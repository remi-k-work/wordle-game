// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { wordChallengeHasWonAtom } from "@/features/game/state/word-challenge";
import { modalIsOpenAtom, modalMachineAtom } from "@/state/modal";

// components
import { Button } from "@base-ui/react";
import { useGT } from "gt-tanstack-start";
import { T } from "gt-react";
import { Modal } from "@/ui/modal";
import { YouWin } from "./you-win";
import { Nevermind } from "./nevermind";
import { GameFlowButton } from "@/features/game/ui/flow-button";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function WinOrLoseModal() {
  // Derived boolean atom: re-renders only when visibility actually flips
  const isOpen = useAtomValue(modalIsOpenAtom("status"));
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  const hasWon = useAtomValue(wordChallengeHasWonAtom);
  const gt = useGT();

  return (
    <Modal isOpen={isOpen} title={hasWon ? gt("You Win") : gt("Run Over")}>
      {hasWon ? <YouWin /> : <Nevermind />}

      <section className={DIALOG_FOOTER_CLASSES}>
        <GameFlowButton keepText tabIndex={-1} />
        <Button tabIndex={-1} className="button bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
          <XCircleIcon className="size-11" />
          <T>Maybe Later</T>
        </Button>
      </section>
    </Modal>
  );
}
