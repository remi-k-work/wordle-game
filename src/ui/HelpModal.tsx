// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { activeModalAtom, languageAtom } from "@/atoms";

// components
import Modal from "./Modal";
import Help from "./Help";

export default function HelpModal() {
  const activeModal = useAtomValue(activeModalAtom);
  const language = useAtomValue(languageAtom);

  if (activeModal === "help") {
    return (
      <Modal title={language === "En" ? "Help" : "Pomoc"}>
        <Help />
      </Modal>
    );
  }

  return null;
}
