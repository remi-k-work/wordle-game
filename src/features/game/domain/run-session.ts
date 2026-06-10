// services, features, and other libraries
import { DateTime, Option } from "effect";

// types
import type { RunSession, WordScore } from ".";

// Add a solved word score into the ongoing arcade run
export const bankWordScore = ({ runScore, streak, bestRunScore, bestStreak, ...runSession }: RunSession, { wordScore }: WordScore) =>
  ({
    ...runSession,
    runScore: runScore + wordScore,
    streak: streak + 1,
    bestRunScore: Math.max(bestRunScore, runScore + wordScore),
    bestStreak: Math.max(bestStreak, streak + 1),
  }) as const satisfies RunSession;

// Reset only the active run progress while preserving historical session stats
export const resetCurrentRunSession = (runSession: RunSession) =>
  ({
    ...runSession,
    runId: Option.none(),
    createdAt: Option.none(),
    runScore: 0,
    streak: 0,
    lastRunScore: 0,
    lastStreak: 0,
  }) as const satisfies RunSession;

// Start a new arcade run while preserving historical session stats
export const startRunSession = ({ runId, createdAt, ...runSession }: RunSession, now: DateTime.Utc) =>
  ({
    ...runSession,
    runId: Option.isNone(runId) ? Option.some(crypto.randomUUID()) : runId,
    createdAt: Option.isNone(createdAt) ? Option.some(now) : createdAt,
    runScore: 0,
    streak: 0,
    lastRunScore: 0,
    lastStreak: 0,
  }) as const satisfies RunSession;

// Close out the active run and record it as the latest completed run
export const finishRunSession = ({ runScore, streak, ...runSession }: RunSession) =>
  ({
    ...runSession,
    runId: Option.none(),
    createdAt: Option.none(),
    runScore: 0,
    streak: 0,
    lastRunScore: runScore,
    lastStreak: streak,
  }) as const satisfies RunSession;
