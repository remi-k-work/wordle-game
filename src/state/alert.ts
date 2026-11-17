// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { alertMachine } from "@/machines/alert";
import { createMachineState } from "@/lib/machine-atoms";

// constants
import { ALERT_FORFEIT_RUN_STATE } from "@/machines/alert/constants";

const alertMachineBag = createActorAtoms(RuntimeAtom, alertMachine);
export const { snapshot: alertMachineAtom, send: alertMachineSendAtom } = createMachineState(alertMachine, alertMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const alertIsForfeitRunAtom = alertMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches(ALERT_FORFEIT_RUN_STATE)));
