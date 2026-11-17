// services, features, and other libraries
import { Schema } from "effect";
import { RunDeathReason } from "@/features/game/domain/models";

// types
export type RunSession = typeof RunSession.Type;
export type RunResult = typeof RunResult.Type;

// Wire schemas for the fields the active run session and the completed-run summary both carry
const RunId = Schema.Trim.check(Schema.isUUID());
const RunTimestamp = Schema.DateTimeUtc;
const RunPoints = Schema.Natural;

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export const RunSession = Schema.Struct({
  runId: Schema.Option(RunId),
  createdAt: Schema.Option(RunTimestamp),
  runScore: RunPoints,
  streak: RunPoints,
  bestRunScore: RunPoints,
  bestStreak: RunPoints,
});

// Immutable summary of a completed run. This is intentionally separate from the active persisted session
export const RunResult = Schema.Struct({
  runId: RunId,
  createdAt: RunTimestamp,
  finishedAt: RunTimestamp,
  runScore: RunPoints,
  streak: RunPoints,
  deathReason: RunDeathReason,
});
