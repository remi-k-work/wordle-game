// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { modalMachine } from "@/machines/modal";
import { createMachineAtom } from "@/domain/machine-atom";

// types
export type ModalType = "help" | "status" | "voice-settings" | "high-score" | "override-hack";

// The modal machine is now a living actor inside the effect atom
export const modalMachineAtom = createMachineAtom(modalMachine);

// Derived boolean family: subscribe to a single modal's visibility instead of
// the full snapshot — only the modal whose visibility actually flipped
// re-renders on open/close transitions
export const modalIsOpenAtom = Atom.family((modalType: ModalType) => modalMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches(modalType))));
