// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Modal } from "@/ui/modal";
import { Content } from "./content";

export function HelpModal() {
  const modalMachineSnapshot = useAtomValue(modalMachineAtom);

  return (
    <Modal isOpen={modalMachineSnapshot.matches("help")} title="Help">
      <Content />
    </Modal>
  );
}
