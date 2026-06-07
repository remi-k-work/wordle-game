// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { activeModalAtom } from "@/features/game/state";

// components
import { Modal } from "@/ui/Modals";
import { Content } from "./Content";

export function VoiceSettingsModal() {
  const activeModal = useAtomValue(activeModalAtom);

  return (
    <Modal isOpen={activeModal === "voice-settings"} title="Voice Settings">
      <Content />
    </Modal>
  );
}
