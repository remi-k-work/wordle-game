// services, features, and other libraries
import { alertMachine } from "@/machines/alert";
import { createMachineAtom } from "@/domain";

// The alert machine is now a living actor inside the effect atom
export const alertMachineAtom = createMachineAtom(alertMachine);
