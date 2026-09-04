// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";
import { useGT } from "gt-next";

// components
import { Modal } from "@/ui/modal";

// types
import type { ReactNode } from "react";

type ModalState = "help" | "high-score" | "voice-settings" | "override-hack";

interface StateModalProps {
  state: ModalState;
  titleKey: "Help" | "High Score" | "Voice Settings" | "AI Override";
  children: ReactNode;
}

// Replaces the four copy-pasted `matches(key)+Modal+Content` wrappers with a
// single state-driven shell. Title keys stay static literals for gt-next
// extraction.
export function StateModal({ state, titleKey, children }: StateModalProps) {
  const modalMachineSnapshot = useAtomValue(modalMachineAtom);
  const gt = useGT();

  return (
    <Modal isOpen={modalMachineSnapshot.matches(state)} title={gt(titleKey)}>
      {children}
    </Modal>
  );
}
