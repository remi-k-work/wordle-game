// services, features, and other libraries
import { Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { wordMetaMachine } from "@/features/game/machines/word-meta";
import { solutionsLanguageAtom } from "@/features/settings/state";
import { inspect, wordChallengeTheSecretWordAtom } from ".";

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

// Bootstrapper - the reactive bridge - to automatically reload the word meta (when the solutions language or the secret word changes)
export const wordMetaBootstrapperAtom = Atom.make((get) => {
  const solutionsLanguage = get(solutionsLanguageAtom);
  const theSecretWord = get(wordChallengeTheSecretWordAtom);

  // Only trigger the actor if the secret word actually exists
  if (Option.isSome(theSecretWord)) get.set(wordMetaMachineAtom, { type: "loadRequested", theSecretWord: theSecretWord.value, solutionsLanguage });
}).pipe(Atom.keepAlive);
