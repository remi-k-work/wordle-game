// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { createActor } from "xstate";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";
import type { SolutionsLanguage } from "@/features/game/domain";

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
export const highScoreNewHighScoreIdAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.newHighScoreId));

// Atom to fetch the top 10 high scores
export const top10HighScoresAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.gen(function* () {
      const { top10HighScores } = yield* RpcHighScoreClient;
      return yield* top10HighScores(solutionsLanguage);
    })
  )
);
