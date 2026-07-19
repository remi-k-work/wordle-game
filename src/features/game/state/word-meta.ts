// services, features, and other libraries
import { Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type WordMetaMachineSnapshot = SnapshotFrom<typeof wordMetaMachine>;
type WordMetaMachineEvent = EventFromLogic<typeof wordMetaMachine>;
type WordMetaMachineActor = Actor<typeof wordMetaMachine>;

// Creates an Atom-owned XState actor reference
const wordMetaMachineActorAtom = Atom.make<WordMetaMachineActor>((get) => {
  const actor = createActor(wordMetaMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The word meta machine is now a living actor inside the effect atom
export const wordMetaMachineAtom = Atom.writable<WordMetaMachineSnapshot, WordMetaMachineEvent>(
  (get) => {
    const actor = get(wordMetaMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(wordMetaMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const wordMetaTheRiddleAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theRiddle));
export const wordMetaWordDefinitionAtom = wordMetaMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordDefinition));

// The riddle text with Markdown stripped and whitespace collapsed for TTS
export const wordMetaSanitizedRiddleAtom = Atom.make((get) => {
  const riddleOutput = Option.getOrNull(get(wordMetaTheRiddleAtom));
  if (!riddleOutput) return null;

  return (
    riddleOutput
      // Remove Markdown emphasis (*, **, _, __)
      .replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, "$1")
      // Inline code
      .replace(/`(.*?)`/g, "$1")
      // Headings and Blockquotes
      .replace(/^[#>]{1,6}\s*/gm, "")
      // Remove common Markdown list markers
      .replace(/^[-*+]\s+/gm, "")
      // Collapse all whitespace
      .replace(/\s+/g, " ")
      // Fix spacing before punctuation (TTS improvement)
      .replace(/\s+([?.!,;:])/g, "$1")
      .trim()
  );
});
