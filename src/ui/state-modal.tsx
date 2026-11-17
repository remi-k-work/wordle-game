// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalIsOpenAtom } from "@/state/modal";
import { useMessages } from "gt-react";

// components
import { Modal } from "@/ui/modal";

// types
import type { StateModalType } from "@/machines/modal/models";
import type { ReactNode } from "react";

interface StateModalProps {
  state: StateModalType;
  children: ReactNode;
}

// constants
import { MODAL_TITLES } from "@/machines/modal/constants";

// Replaces the four copy-pasted `matches(key)+Modal+Content` wrappers with a
// single state-driven shell. Each shell subscribes to its own derived boolean
// atom, so only the modal whose visibility flipped re-renders on open/close
export function StateModal({ state, children }: StateModalProps) {
  const isOpen = useAtomValue(modalIsOpenAtom(state));
  const messages = useMessages();

  return (
    <Modal isOpen={isOpen} title={messages(MODAL_TITLES[state])}>
      {children}
    </Modal>
  );
}
