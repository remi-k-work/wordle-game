// services, features, and other libraries
import { Equal, Option } from "effect";
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/machines/run-session/models";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { createMachineState } from "@/lib/machine-atoms";

// types
import type { RunResult } from "@/features/game/machines/run-session/models";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/machines/run-session/constants";

// Persistent storage for tracking the current arcade run progress and high water marks
const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession,
  defaultValue: () => INITIAL_RUN_SESSION,
}).pipe(Atom.keepAlive);

const runSessionMachineBag = Atom.make((get) => createActorAtoms(RuntimeAtom, runSessionMachine, { input: get.once(runSessionAtom) })).pipe(Atom.keepAlive);
export const { snapshot: runSessionMachineAtom, send: runSessionMachineSendAtom } = createMachineState(runSessionMachine, runSessionMachineBag, {
  onSnapshot: (get, snapshot) => {
    if (!Equal.equals(get.once(runSessionAtom), snapshot.context)) get.set(runSessionAtom, snapshot.context);
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
