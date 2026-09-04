// components
import { StateModal } from "@/ui/state-modal";
import { Content } from "./content";

export function HighScoreModal() {
  return (
    <StateModal state="high-score" titleKey="High Score">
      <Content />
    </StateModal>
  );
}
