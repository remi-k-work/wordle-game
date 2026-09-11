// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { createMachineAtom } from "@/lib/machine-atom";

// The word meta machine is now a living actor inside the effect atom
export const wordMetaMachineAtom = createMachineAtom(wordMetaMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));
export const wordMetaTheRiddleAudioAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddleAudio));
