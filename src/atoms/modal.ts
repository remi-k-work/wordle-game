// services, features, and other libraries
import { Atom } from "@effect-atom/atom-react";

// types
type ModalType = "help" | "status" | null;

// Single source of truth for the modal state
export const activeModalAtom = Atom.make<ModalType>(null);

export const openModalAction = Atom.fn((modalType: NonNullable<ModalType>) => Atom.set(activeModalAtom, modalType));
export const closeModalAction = Atom.fn(() => Atom.set(activeModalAtom, null));
