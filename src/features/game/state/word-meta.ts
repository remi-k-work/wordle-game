// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { createMachineAtom } from "@/lib/machine-atom";
import { sanitizedTextAtom } from "@/lib/formatters";

// The word meta machine is now a living actor inside the effect atom
export const wordMetaMachineAtom = createMachineAtom(wordMetaMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));

// The riddle text with Markdown stripped and whitespace collapsed for TTS
export const wordMetaSanitizedRiddleAtom = sanitizedTextAtom(wordMetaTheRiddleAtom);

// The definition text with Markdown stripped and whitespace collapsed for TTS
export const wordMetaSanitizedDefinitionAtom = sanitizedTextAtom(wordMetaWordDefinitionAtom);
