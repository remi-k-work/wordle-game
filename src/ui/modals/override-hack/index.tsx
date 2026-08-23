// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Modal } from "@/ui/modal";
import { Content } from "./content";
import { useGT } from "gt-next";

export function OverrideHackModal() {
  const modalMachineSnapshot = useAtomValue(modalMachineAtom);
  const gt = useGT();

  return (
    <Modal isOpen={modalMachineSnapshot.matches("override-hack")} title={gt("AI Override")}>
      <Content />
    </Modal>
  );
}
