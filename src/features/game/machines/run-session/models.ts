// services, features, and other libraries
import { Schema } from "effect";
import { RunDeathReason, WordScore } from "@/features/game/domain/models";
import { WordChallenge } from "@/features/game/machines/word-challenge/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type RunSession = typeof RunSession.Type;
export type RunResult = typeof RunResult.Type;
export type Events = EventUnion<typeof Events>;

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

// Events are part of the machine's interface; guards receive this union as `event`
export const Events = {
  solutionsLanguageChanged: Schema.Struct({}),
  newRunStarted: Schema.Struct({}),
  nextWordRequested: Schema.Struct({}),
  runForfeited: Schema.Struct({ wordChallenge: WordChallenge }),
  wordWon: Schema.Struct({ wordScore: WordScore }),
  runScoreSpent: Schema.Struct({ amount: WordScore.fields.wordScore }),
  wordLost: Schema.Struct({}),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
const saveFinishedRunParams = Schema.Struct({ runSession: RunSession, deathReason: RunDeathReason });
const onRunFinishedParams = Schema.Struct({ runSession: RunSession });

export const Actions = {
  clearFinishedRun: { params: Schema.Struct({}) },
  trackStartedNewRun: { params: Schema.Struct({}) },
  saveFinishedRun: { params: saveFinishedRunParams },
  trackForfeitedRun: { params: Schema.Struct({ runSession: RunSession, wordChallenge: WordChallenge }) },
  onRunFinished: { params: onRunFinishedParams },

  // Command fan-outs owned by the run session: it knows when a run starts,
  // advances to the next word, or ends, so it is the one that tells the other
  // feature machines and the modal what to do
  startNewRun: { params: Schema.Struct({}) },
  requestNextWord: { params: Schema.Struct({}) },
  bankWonWord: { params: Schema.Struct({}) },
  finishLostRun: { params: Schema.Struct({}) },
  forfeitRun: { params: Schema.Struct({}) },
};
