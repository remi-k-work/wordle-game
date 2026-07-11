// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { inspect } from "@/features/game/state";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type HighScoreMachineSnapshot = SnapshotFrom<typeof highScoreMachine>;
type HighScoreMachineEvent = EventFromLogic<typeof highScoreMachine>;
type HighScoreMachineActor = Actor<typeof highScoreMachine>;

// Creates an Atom-owned XState actor reference
const highScoreMachineActorAtom = Atom.make<HighScoreMachineActor>((get) => {
  const actor = createActor(highScoreMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The high score machine is now a living actor inside the effect atom
export const highScoreMachineAtom = Atom.writable<HighScoreMachineSnapshot, HighScoreMachineEvent>(
  (get) => {
    const actor = get(highScoreMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(highScoreMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const highScorePlayerNameAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.playerName));
export const highScoreRunScoreAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const highScoreStreakAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const highScoreSolutionsLanguageAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
