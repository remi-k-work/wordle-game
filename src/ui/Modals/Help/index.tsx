// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { activeModalAtom, languageAtom } from "@/atoms";

// components
import { Modal } from "@/ui/Modals";
import { Content } from "./Content";

export function HelpModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const language = useAtomValue(languageAtom);

  return (
    <Modal isOpen={activeModal === "help"} title={language === "En" ? "Help" : "Pomoc"}>
      <Content />
    </Modal>
  );
}
