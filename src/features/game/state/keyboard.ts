// services, features, and other libraries
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { keyboardMachine } from "@/features/game/machines/keyboard";
import { createMachineState } from "@/lib/machine-atoms";

const keyboardMachineBag = createActorAtoms(RuntimeAtom, keyboardMachine);
export const { snapshot: keyboardMachineAtom, send: keyboardMachineSendAtom } = createMachineState(keyboardMachine, keyboardMachineBag);
