// components
import { StateModal } from "@/ui/state-modal";
import { Content } from "./content";

export function VoiceSettingsModal() {
  return (
    <StateModal state="voice-settings" titleKey="Voice Settings">
      <Content />
    </StateModal>
  );
}
