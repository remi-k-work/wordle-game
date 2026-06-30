// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/domain";
import { makePersistentMachineAtom } from "@/lib/machine-atom-factory";
import { runSessionMachine } from "@/features/game/machines/run-session";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

// Persistent storage for tracking the current arcade run progress and high water marks
const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession.mapFields(Struct.pick(["runId", "createdAt", "runScore", "streak", "lastRunScore", "lastStreak", "bestRunScore", "bestStreak"])),
  defaultValue: () => INITIAL_RUN_SESSION,
});

// The run session machine is now a living actor inside the effect atom
export const runSessionMachineAtom = makePersistentMachineAtom(
  runSessionMachine,
  runSessionAtom,
  // The machine's context is an exact 1:1 match with the KVS schema
  (context) => context
);

// Specialized selectors for granular state access and optimized re-renders
export const runSessionRunIdAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runId));
export const runSessionCreatedAtAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.createdAt));
export const runSessionRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const runSessionStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const runSessionLastRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.lastRunScore));
export const runSessionLastStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.lastStreak));
export const runSessionBestRunScoreAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestRunScore));
export const runSessionBestStreakAtom = runSessionMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.bestStreak));
