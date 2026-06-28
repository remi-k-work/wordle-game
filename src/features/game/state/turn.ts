// services, features, and other libraries
import { makeMachineAtom } from "@/lib/machine-atom-factory";
import { turnMachine } from "@/features/game/machines";

// The turn machine is now a living actor inside the effect atom
export const turnMachineAtom = makeMachineAtom(turnMachine);
