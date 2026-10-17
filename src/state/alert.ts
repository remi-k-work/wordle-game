// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { alertMachine } from "@/machines/alert";
import { createMachineAtom } from "@/domain/machine-atom";

// The alert machine is now a living actor inside the effect atom
export const alertMachineAtom = createMachineAtom(alertMachine);

// Derived boolean: subscribe to this instead of the full snapshot when only
// the machine state (not context) is needed
export const alertIsForfeitRunAtom = alertMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("forfeit-run")));
