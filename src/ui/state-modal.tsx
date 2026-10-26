// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { modalIsOpenAtom } from "@/state/modal";
import { msg, useMessages } from "gt-react";

// components
import { Modal } from "@/ui/modal";

// types
import type { ModalType } from "@/state/modal";
import type { ReactNode } from "react";

// The win-or-lose modal derives its title from game state, so it builds its
// own `Modal`; every other modal registers its static title here
type StateModalType = Exclude<ModalType, "status">;

interface StateModalProps {
  state: StateModalType;
  children: ReactNode;
}

// A dynamic gt(titleKey) call is not statically extractable, so the titles are
// registered as messages here and looked up by the modal's own state key —
// there is no second prop to keep in sync with `state`
const MODAL_TITLES = {
  help: msg("Help"),
  "high-score": msg("High Score"),
  "voice-settings": msg("Voice Settings"),
  "override-hack": msg("AI Override"),
  // `satisfies` keeps the map exhaustive over the state keys, so adding a modal
  // without a title is a compile error rather than a blank header
} as const satisfies Record<StateModalType, unknown>;

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
