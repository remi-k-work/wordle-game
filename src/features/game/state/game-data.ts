// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { gameDataMachine } from "@/features/game/machines/game-data";
import { createMachineState } from "@/lib/machine-atoms";

// types
type GameDataPhase = "loading" | "failure" | "ready";

const gameDataMachineBag = createActorAtoms(RuntimeAtom, gameDataMachine);
export const { snapshot: gameDataMachineAtom, send: gameDataMachineSendAtom } = createMachineState(gameDataMachine, gameDataMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const gameDataKeypadAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.keypad));

// The route's phase, as a 3-value string: it suppresses atom notifications the
// same way `RunAction` does, and `selectingWord` reads as `ready` so the board
// does not flash a skeleton between words
export const gameDataPhaseAtom = gameDataMachineAtom.pipe(
  Atom.map((snapshot): GameDataPhase => (snapshot.matches("failure") ? "failure" : snapshot.matches("loading") ? "loading" : "ready"))
);
