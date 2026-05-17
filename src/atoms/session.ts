/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Schema } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { Runtime } from "./runtime";

// types
import type { Session } from "@/domain";

// Persistent session storage for tracking run progress and best performance
export const sessionAtom = Atom.kvs({
  runtime: Runtime as any,
  key: "@wordle/session",
  schema: Schema.Struct({
    totalScore: Schema.Int.pipe(Schema.nonNegative()),
    currentStreak: Schema.Int.pipe(Schema.nonNegative()),
    bestRun: Schema.Int.pipe(Schema.nonNegative()),
    lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
    lastRunStreak: Schema.Int.pipe(Schema.nonNegative()),
  }),
  defaultValue: () => ({ totalScore: 0, currentStreak: 0, bestRun: 0, lastRunScore: 0, lastRunStreak: 0 }) as const satisfies Session,
});

// Specialized selectors for session-level state
export const sessionTotalScoreAtom = sessionAtom.pipe(Atom.map((state) => state.totalScore));
export const currentStreakAtom = sessionAtom.pipe(Atom.map((state) => state.currentStreak));
export const bestRunAtom = sessionAtom.pipe(Atom.map((state) => state.bestRun));
export const lastRunScoreAtom = sessionAtom.pipe(Atom.map((state) => state.lastRunScore));
export const lastRunStreakAtom = sessionAtom.pipe(Atom.map((state) => state.lastRunStreak));
