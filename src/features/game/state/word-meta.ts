// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { createMachineAtom } from "@/domain/machine-atom";

// The word meta machine is now a living actor inside the effect atom
export const wordMetaMachineAtom = createMachineAtom(wordMetaMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));
export const wordMetaTheRiddleAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddleAudio));
export const wordMetaWordDefinitionAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinitionAudio));

// Derived booleans: subscribe to these instead of the full snapshot when only
// the machine state (not context) is needed
export const wordMetaIsAwaitingAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("awaitingTheSecretWord")));
export const wordMetaIsLoadingAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("loading")));
export const wordMetaIsFetchingAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("fetchingAudio")));
