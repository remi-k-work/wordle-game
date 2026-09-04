// components
import { StateModal } from "@/ui/state-modal";
import { Content } from "./content";

export function OverrideHackModal() {
  return (
    <StateModal state="override-hack" titleKey="AI Override">
      <Content />
    </StateModal>
  );
}
