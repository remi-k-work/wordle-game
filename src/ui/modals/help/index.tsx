// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { activeModalAtom } from "@/features/game/state";

// components
import { Modal } from "@/ui/modals";
import { Content } from "./content";

export function HelpModal() {
  const activeModal = useAtomValue(activeModalAtom);

  return (
    <Modal isOpen={activeModal === "help"} title="Help">
      <Content />
    </Modal>
  );
}
