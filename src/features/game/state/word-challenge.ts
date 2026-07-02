// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type WordChallengeMachineSnapshot = SnapshotFrom<typeof wordChallengeMachine>;
type WordChallengeMachineEvent = EventFromLogic<typeof wordChallengeMachine>;
type WordChallengeMachineActor = Actor<typeof wordChallengeMachine>;

// Creates an Atom-owned XState actor reference
const wordChallengeMachineActorAtom = Atom.make<WordChallengeMachineActor>((get) => {
  const actor = createActor(wordChallengeMachine);
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The word challenge machine is now a living actor inside the effect atom
export const wordChallengeMachineAtom = Atom.writable<WordChallengeMachineSnapshot, WordChallengeMachineEvent>(
  (get) => {
    const actor = get(wordChallengeMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(wordChallengeMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));
