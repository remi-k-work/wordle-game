// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/domain";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { inspect } from ".";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type RunSessionMachineSnapshot = SnapshotFrom<typeof runSessionMachine>;
type RunSessionMachineEvent = EventFromLogic<typeof runSessionMachine>;
type RunSessionMachineActor = Actor<typeof runSessionMachine>;

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

// Persistent storage for tracking the current arcade run progress and high water marks
const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession.mapFields(Struct.pick(["runId", "createdAt", "runScore", "streak", "bestRunScore", "bestStreak"])),
  defaultValue: () => INITIAL_RUN_SESSION,
});

// Creates an Atom-owned XState actor reference
const runSessionMachineActorAtom = Atom.make<RunSessionMachineActor>((get) => {
  // Read persisted state from storage
  const persistedState = get.once(runSessionAtom);

  const actor = createActor(runSessionMachine, { input: persistedState, inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The run session machine is now a living actor inside the effect atom
export const runSessionMachineAtom = Atom.writable<RunSessionMachineSnapshot, RunSessionMachineEvent>(
  (get) => {
    const actor = get(runSessionMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);

      // Save back to local storage
      get.set(runSessionAtom, snapshot.context);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(runSessionMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const runSessionRunIdAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runId));
export const runSessionCreatedAtAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.createdAt));
export const runSessionRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const runSessionStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const runSessionBestRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestRunScore));
export const runSessionBestStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestStreak));
