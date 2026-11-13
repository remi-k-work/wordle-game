// services, features, and other libraries
import { Equal, Option } from "effect";
import { Atom } from "effect/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/domain/models";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { createMachineAtom } from "@/domain/machine-atom";

// types
import type { RunResult } from "@/features/game/domain/models";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain/constants";

// Persistent storage for tracking the current arcade run progress and high water marks
const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession,
  defaultValue: () => INITIAL_RUN_SESSION,
}).pipe(Atom.keepAlive);

// The run session machine is now a living actor inside the effect atom, hydrated from
// (and persisting back to) durable storage whenever its context actually changes
export const runSessionMachineAtom = createMachineAtom(runSessionMachine, {
  input: (get) => get.once(runSessionAtom),
  onSnapshot: (get, snapshot) => {
    // Save back to local storage only when the context actually changed:
    // onSnapshot fires for every snapshot — including the first one, which
    // merely re-reads what was just hydrated, and the state-only transitions
    // this machine makes on its way into `active`/`inactive` — and persisting
    // an identical value back is a wasted encode + localStorage round-trip
    // (the same guard gameSettingsMachineAtom applies; a write the schema
    // rejects still retries on the next snapshot, since the atom keeps the
    // value it was able to store last)
    if (Equal.equals(get.once(runSessionAtom), snapshot.context)) return;
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
