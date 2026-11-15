// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { modalMachine } from "@/machines/modal";
import { createMachineState } from "@/lib/machine-atoms";

// types
import type { ModalType } from "@/machines/modal";

const modalMachineBag = createActorAtoms(RuntimeAtom, modalMachine);
export const { snapshot: modalMachineAtom, send: modalMachineSendAtom } = createMachineState(modalMachine, modalMachineBag);

// Derived boolean family: subscribe to a single modal's visibility instead of the full snapshot
export const modalIsOpenAtom = Atom.family((modalType: ModalType) => modalMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches(modalType))));
