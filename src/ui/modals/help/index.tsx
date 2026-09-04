// components
import { StateModal } from "@/ui/state-modal";
import { Content } from "./content";

export function HelpModal() {
  return (
    <StateModal state="help" titleKey="Help">
      <Content />
    </StateModal>
  );
}
