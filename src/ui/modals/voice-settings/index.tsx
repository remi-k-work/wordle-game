// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Modal } from "@/ui/modal";
import { Content } from "./content";

export function VoiceSettingsModal() {
  const modalMachineSnapshot = useAtomValue(modalMachineAtom);

  return (
    <Modal isOpen={modalMachineSnapshot.matches("voice-settings")} title="Voice Settings">
      <Content />
    </Modal>
  );
}
