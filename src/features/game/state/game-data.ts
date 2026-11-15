// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { gameDataMachine } from "@/features/game/machines/game-data";
import { createMachineState } from "@/lib/machine-atoms";

const gameDataMachineBag = createActorAtoms(RuntimeAtom, gameDataMachine);
export const { snapshot: gameDataMachineAtom, send: gameDataMachineSendAtom } = createMachineState(gameDataMachine, gameDataMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const gameDataKeypadAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.keypad));

// Derived boolean: the page shell only needs to know whether data is pending or failed
export const gameDataIsLoadingOrFailedAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("loading") || snapshot.matches("failure")));
