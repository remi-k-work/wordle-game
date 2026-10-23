// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalIsOpenAtom } from "@/state/modal";
import { msg, useMessages } from "gt-react";

// components
import { Modal } from "@/ui/modal";

// types
import type { ModalType } from "@/state/modal";
import type { ReactNode } from "react";

// constants
// A dynamic gt(titleKey) call is not statically extractable, so the titles are
// registered as messages here and looked up by key at render time
const MODAL_TITLES = {
  Help: msg("Help"),
  "High Score": msg("High Score"),
  "Voice Settings": msg("Voice Settings"),
  "AI Override": msg("AI Override"),
} as const;

interface StateModalProps {
  state: ModalType;
  titleKey: keyof typeof MODAL_TITLES;
  children: ReactNode;
}

// Replaces the four copy-pasted `matches(key)+Modal+Content` wrappers with a
// single state-driven shell. Each shell subscribes to its own derived boolean
// atom, so only the modal whose visibility flipped re-renders on open/close
export function StateModal({ state, titleKey, children }: StateModalProps) {
  const isOpen = useAtomValue(modalIsOpenAtom(state));
  const messages = useMessages();

  return (
    <Modal isOpen={isOpen} title={messages(MODAL_TITLES[titleKey])}>
      {children}
    </Modal>
  );
}
