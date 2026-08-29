// services, features, and other libraries
import { Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { createMachineAtom } from "@/lib/machine-atom";
import { formatTextForTTS } from "@/lib/formatters";

// The word meta machine is now a living actor inside the effect atom
export const wordMetaMachineAtom = createMachineAtom(wordMetaMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));

// The riddle text with Markdown stripped and whitespace collapsed for TTS
export const wordMetaSanitizedRiddleAtom = Atom.make((get) => get(wordMetaTheRiddleAtom).pipe(Option.map(formatTextForTTS), Option.getOrNull));

// The definition text with Markdown stripped and whitespace collapsed for TTS
export const wordMetaSanitizedDefinitionAtom = Atom.make((get) => get(wordMetaWordDefinitionAtom).pipe(Option.map(formatTextForTTS), Option.getOrNull));
