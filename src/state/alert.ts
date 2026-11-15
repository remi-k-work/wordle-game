// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { alertMachine } from "@/machines/alert";
import { createMachineState } from "@/lib/machine-atoms";

// constants
import { ALERT_FORFEIT_RUN_STATE } from "@/machines/alert";

const alertMachineBag = createActorAtoms(RuntimeAtom, alertMachine);
export const { snapshot: alertMachineAtom, send: alertMachineSendAtom } = createMachineState(alertMachine, alertMachineBag);

// Derived boolean: subscribe to this instead of the full snapshot when only the machine state (not context) is needed
export const alertIsForfeitRunAtom = alertMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches(ALERT_FORFEIT_RUN_STATE)));
