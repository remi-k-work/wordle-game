// services, features, and other libraries
import { alertMachine } from "@/machines/alert";
import { createMachineAtom } from "@/lib/machine-atom";

// The alert machine is now a living actor inside the effect atom
export const alertMachineAtom = createMachineAtom(alertMachine);
