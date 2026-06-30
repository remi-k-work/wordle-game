// services, features, and other libraries
import { makeMachineAtom } from "@/lib/machine-atom-factory";
import { modalMachine } from "@/features/game/machines/modal";

// The modal machine is now a living actor inside the effect atom
export const modalMachineAtom = makeMachineAtom(modalMachine);
