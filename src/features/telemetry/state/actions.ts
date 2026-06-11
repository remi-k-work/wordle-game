// services, features, and other libraries
import { Effect, Metric, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import {
  arcadeRunLength,
  failedWords,
  gamesPlayed,
  guessesToWin,
  invalidGuesses,
  openingGuesses,
  perfectGames,
  runDeathReason,
  runsStarted,
  timeToSolve,
  validGuesses,
} from "@/features/telemetry/domain";
import { runIdAtom, streakAtom, theSecretWordAtom } from "@/features/game/state";
import { solutionsLanguageAtom } from "@/features/settings/state";

// types
import type { GameState, RunSession, WordScore } from "@/features/game/domain";

// Track metrics related to the action of submitting a new guess
export const trackSubmitGuessAction = Effect.fnUntraced(function* (
  currGameState: GameState,
  nextGameState: GameState,
  nextRunSession: RunSession,
  get: Atom.FnContext
) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const runId = Option.getOrElse(nextRunSession.runId, () => "unknown");
  const solutionsLanguage = get(solutionsLanguageAtom);

  // Track both invalid and valid guesses
  if (nextGameState.isInvalidGuess) {
    // Invalid guess has been made
    yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);
  } else {
    // Must have been a valid guess otherwise
    yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);

    // Track the opening guess for the very first valid submission of the game
    if (currGameState.currentTurn === 1)
      yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ runId, solutionsLanguage })), currGameState.currentGuessWord);
  }

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the action of starting a new run
export const trackStartNewRunAction = Effect.fnUntraced(function* (get: Atom.FnContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const runIdOption = get(runIdAtom);
  const runId = Option.getOrElse(runIdOption, () => "unknown");
  const solutionsLanguage = get(solutionsLanguageAtom);

  yield* Metric.update(runsStarted.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the action of forfeiting a run
export const trackForfeitRunAction = Effect.fnUntraced(function* (get: Atom.FnContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const runIdOption = get(runIdAtom);
  const runId = Option.getOrElse(runIdOption, () => "unknown");
  const solutionsLanguage = get(solutionsLanguageAtom);
  const streak = get(streakAtom);

  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ runId, solutionsLanguage })), streak);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ runId, solutionsLanguage })), "Forfeit");

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the event of winning the game
export const trackWordWonEvent = Effect.fnUntraced(function* ({ currentTurn }: GameState, { timeSeconds }: WordScore) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const runIdOption = yield* Atom.get(runIdAtom);
  const runId = Option.getOrElse(runIdOption, () => "unknown");
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

  const guessedTurn = currentTurn - 1;
  yield* Metric.update(guessesToWin.pipe(Metric.withAttributes({ runId, solutionsLanguage })), guessedTurn);
  yield* Metric.update(timeToSolve.pipe(Metric.withAttributes({ runId, solutionsLanguage })), timeSeconds);
  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(perfectGames.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the event of losing the game
export const trackWordLostEvent = Effect.fnUntraced(function* ({ runId: runIdOption, streak }: RunSession) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const runId = Option.getOrElse(runIdOption, () => "unknown");
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(theSecretWordAtom);

  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ runId, solutionsLanguage })), 1);
  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ runId, solutionsLanguage })), streak);
  yield* Metric.update(failedWords.pipe(Metric.withAttributes({ runId, solutionsLanguage })), theSecretWord);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ runId, solutionsLanguage })), "Guesses");

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});
