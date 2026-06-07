// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";

// types
type ModalType = "help" | "status" | "voice-settings" | null;

// Single source of truth for the modal state
export const activeModalAtom = Atom.make<ModalType>(null);

export const openModalAction = Atom.fn(
  Effect.fnUntraced(function* (modalType: NonNullable<ModalType>, get: Atom.FnContext) {
    get.set(activeModalAtom, modalType);
  })
);

export const closeModalAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(activeModalAtom, null);
  })
);
