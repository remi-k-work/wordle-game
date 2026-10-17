// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { gameDataMachine } from "@/features/game/machines/game-data";
import { createMachineAtom } from "@/domain/machine-atom";

// The game data machine is now a living actor inside the effect atom
export const gameDataMachineAtom = createMachineAtom(gameDataMachine);

// Specialized selectors for granular state access and optimized re-renders
export const gameDataSolutionsAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutions));
export const gameDataDictionaryAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.dictionary));
export const gameDataKeypadAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.keypad));

// Derived boolean: the page shell only needs to know whether data is pending or failed
export const gameDataIsLoadingOrFailedAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("loading") || snapshot.matches("failure")));
