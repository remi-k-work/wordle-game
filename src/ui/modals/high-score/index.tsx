// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom } from "@/features/game/state";

// components
import { Modal } from "@/ui/modals";
import { Content } from "./content";

export function HighScoreModal() {
  const modalMachineSnapshot = useAtomValue(modalMachineAtom);

  return (
    <Modal isOpen={modalMachineSnapshot.matches("high-score")} title="High Score">
      <Content />
    </Modal>
  );
}
