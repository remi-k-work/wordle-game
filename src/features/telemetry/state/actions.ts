// services, features, and other libraries
import { DateTime, Duration, Effect, Metric, Option } from "effect";
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
import { runSessionAtom, streakAtom, theSecretWordAtom } from "@/features/game/state";
import { solutionsLanguageAtom } from "@/features/settings/state";

// types
import type { GameState, RunSession, WordScore } from "@/features/game/domain";

// A function to log the exact details of a completed arcade run session
export const logCompletedRunEvent = Effect.fn("logCompletedRunEvent")(function* (
  { runId: runIdOption, createdAt: createdAtOption, runScore, streak }: RunSession,
  deathReason: "Forfeit" | "Guesses"
) {
  const runId = Option.getOrElse(runIdOption, () => "unknown");
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(theSecretWordAtom);
  const failedOnWord = deathReason === "Guesses" ? theSecretWord : "N/A";

  // We calculate the total real-world time the run was alive
  const now = yield* DateTime.now;
  const createdAt = Option.getOrElse(createdAtOption, () => now);
  const durationSeconds = DateTime.distance(createdAt, now).pipe(Duration.toSeconds);

  // Enrich the span itself with searchable attributes
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, streak, runScore, deathReason, failedOnWord, durationSeconds });
});

// Track metrics related to the action of submitting a new guess
export const trackSubmitGuessAction = Effect.fnUntraced(function* (currGameState: GameState, nextGameState: GameState, get: Atom.FnContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const solutionsLanguage = get(solutionsLanguageAtom);

  // Track both invalid and valid guesses
  if (nextGameState.isInvalidGuess) {
    // Invalid guess has been made
    yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ solutionsLanguage })), 1);
  } else {
    // Must have been a valid guess otherwise
    yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ solutionsLanguage })), 1);

    // Track the opening guess for the very first valid submission of the game
    if (currGameState.currentTurn === 1)
      yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ solutionsLanguage })), currGameState.currentGuessWord);
  }

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the action of starting a new run
export const trackStartNewRunAction = Effect.fnUntraced(function* (get: Atom.FnContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const solutionsLanguage = get(solutionsLanguageAtom);

  yield* Metric.update(runsStarted.pipe(Metric.withAttributes({ solutionsLanguage })), 1);

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the action of forfeiting a run
export const trackForfeitRunAction = Effect.fnUntraced(function* (get: Atom.FnContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const solutionsLanguage = get(solutionsLanguageAtom);
  const streak = get(streakAtom);

  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ solutionsLanguage })), streak);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ solutionsLanguage })), "Forfeit");

  // Log the exact details of a completed arcade run session
  yield* logCompletedRunEvent(get(runSessionAtom), "Forfeit");

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the event of winning the game
export const trackWordWonEvent = Effect.fnUntraced(function* ({ currentTurn }: GameState, { timeSeconds }: WordScore) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

  const guessedTurn = currentTurn - 1;
  yield* Metric.update(guessesToWin.pipe(Metric.withAttributes({ solutionsLanguage })), guessedTurn);
  yield* Metric.update(timeToSolve.pipe(Metric.withAttributes({ solutionsLanguage })), timeSeconds);
  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(perfectGames.pipe(Metric.withAttributes({ solutionsLanguage })), 1);

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});

// Track metrics related to the event of losing the game
export const trackWordLostEvent = Effect.fnUntraced(function* (runSession: RunSession) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(theSecretWordAtom);

  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ solutionsLanguage })), 1);
  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ solutionsLanguage })), runSession.streak);
  yield* Metric.update(failedWords.pipe(Metric.withAttributes({ solutionsLanguage })), theSecretWord);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ solutionsLanguage })), "Guesses");

  // Log the exact details of a completed arcade run session
  yield* logCompletedRunEvent(runSession, "Guesses");

  // *** TEST CODE ***
  const snapshots = yield* Metric.snapshot;
  yield* Effect.log("snapshots", snapshots);
  // *** TEST CODE ***
});
