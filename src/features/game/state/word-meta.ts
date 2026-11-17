// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { createMachineState } from "@/lib/machine-atoms";

const wordMetaMachineBag = createActorAtoms(RuntimeAtom, wordMetaMachine);
export const { snapshot: wordMetaMachineAtom, send: wordMetaMachineSendAtom } = createMachineState(wordMetaMachine, wordMetaMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));
export const wordMetaTheRiddleAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddleAudio));
export const wordMetaWordDefinitionAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinitionAudio));
export const wordMetaIsAwaitingAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("awaitingTheSecretWord")));
export const wordMetaIsLoadingAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("loading")));
