// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RunSession } from "@/features/game/domain";

// Persistent storage for tracking the current arcade run progress and high water marks
export const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/runSession",
  schema: RunSession.mapFields(Struct.pick(["runScore", "streak", "lastRunScore", "lastStreak", "bestRunScore", "bestStreak"])),
  defaultValue: () => ({ runScore: 0, streak: 0, lastRunScore: 0, lastStreak: 0, bestRunScore: 0, bestStreak: 0 }) as const satisfies RunSession,
});

// Specialized selectors for granular state access and optimized re-renders
export const runScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.runScore));
export const streakAtom = runSessionAtom.pipe(Atom.map((state) => state.streak));
export const lastRunScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.lastRunScore));
export const lastStreakAtom = runSessionAtom.pipe(Atom.map((state) => state.lastStreak));
export const bestRunScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.bestRunScore));
export const bestStreakAtom = runSessionAtom.pipe(Atom.map((state) => state.bestStreak));
