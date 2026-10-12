// services, features, and other libraries
import { modalMachine } from "@/machines/modal";
import { createMachineAtom } from "@/domain";

// The modal machine is now a living actor inside the effect atom
export const modalMachineAtom = createMachineAtom(modalMachine);
