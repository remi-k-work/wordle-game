// services, features, and other libraries
import { Option, Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/domain";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { createMachineAtom } from "@/lib/machine-atom";

// types
import type { RunResult } from "@/features/game/domain";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

// Persistent storage for tracking the current arcade run progress and high water marks
const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession.mapFields(Struct.pick(["runId", "createdAt", "runScore", "streak", "bestRunScore", "bestStreak"])),
  defaultValue: () => INITIAL_RUN_SESSION,
}).pipe(Atom.keepAlive);

// The run session machine is now a living actor inside the effect atom, hydrated from (and
// persisting back to) durable storage on every snapshot.
export const runSessionMachineAtom = createMachineAtom(runSessionMachine, {
  input: (get) => get.once(runSessionAtom),
  onSnapshot: (get, snapshot) => {
    // Save back to local storage
    get.set(runSessionAtom, snapshot.context);
  },
});

// Specialized selectors for granular state access and optimized re-renders
export const runSessionRunIdAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runId));
export const runSessionCreatedAtAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.createdAt));
export const runSessionRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const runSessionStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const runSessionBestRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestRunScore));
export const runSessionBestStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestStreak));

// A completed run belongs to the result UI, not durable active-run storage
export const runResultAtom = Atom.make<Option.Option<RunResult>>(Option.none()).pipe(Atom.keepAlive);
