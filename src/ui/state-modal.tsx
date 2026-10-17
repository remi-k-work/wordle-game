// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalIsOpenAtom } from "@/state/modal";
import { useGT } from "gt-next";

// components
import { Modal } from "@/ui/modal";

// types
import type { ModalType } from "@/state/modal";
import type { ReactNode } from "react";

interface StateModalProps {
  state: ModalType;
  titleKey: "Help" | "High Score" | "Voice Settings" | "AI Override";
  children: ReactNode;
}

// Replaces the four copy-pasted `matches(key)+Modal+Content` wrappers with a
// single state-driven shell. Title keys stay static literals for gt-next
// extraction. Each shell subscribes to its own derived boolean atom, so only
// the modal whose visibility flipped re-renders on open/close transitions
export function StateModal({ state, titleKey, children }: StateModalProps) {
  const isOpen = useAtomValue(modalIsOpenAtom(state));
  const gt = useGT();

  return (
    <Modal isOpen={isOpen} title={gt(titleKey)}>
      {children}
    </Modal>
  );
}
