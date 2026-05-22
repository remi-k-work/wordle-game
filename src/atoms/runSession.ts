/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Schema } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/RuntimeClient";

// types
import type { RunSession } from "@/domain";

// Persistent storage for tracking the current arcade run progress and high water marks
export const runSessionAtom = Atom.kvs({
  runtime: RuntimeAtom as any,
  key: "@wordle/runSession",
  schema: Schema.Struct({
    runScore: Schema.Int.pipe(Schema.nonNegative()),
    streak: Schema.Int.pipe(Schema.nonNegative()),
    lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
    lastRunStreak: Schema.Int.pipe(Schema.nonNegative()),
    bestRunScore: Schema.Int.pipe(Schema.nonNegative()),
  }),
  defaultValue: () => ({ runScore: 0, streak: 0, lastRunScore: 0, lastRunStreak: 0, bestRunScore: 0 }) as const satisfies RunSession,
});

// Specialized selectors for granular state access and optimized re-renders
export const runScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.runScore));
export const streakAtom = runSessionAtom.pipe(Atom.map((state) => state.streak));
export const lastRunScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.lastRunScore));
export const lastRunStreakAtom = runSessionAtom.pipe(Atom.map((state) => state.lastRunStreak));
export const bestRunScoreAtom = runSessionAtom.pipe(Atom.map((state) => state.bestRunScore));
