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
import { sessionIdAtom } from "@/features/player/state";
import {
  runSessionCreatedAtAtom,
  runSessionRunIdAtom,
  runSessionRunScoreAtom,
  runSessionStreakAtom,
  theSecretWordAtom,
  turnMachineAtom,
} from "@/features/game/state";
import { solutionsLanguageAtom } from "@/features/settings/state";

// types
import type { GameState, WordScore } from "@/features/game/domain";

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
export const logWordWonEvent = Effect.fn("logWordWonEvent")(function* ({ currentTurn, theSecretWord }: GameState, { timeSeconds }: WordScore) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(yield* Atom.get(runSessionRunIdAtom));
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const guessedTurn = currentTurn - 1;

  // Enrich the span itself with searchable attributes (stream 1 -> run_word_event)
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: Math.floor(timeSeconds) });
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
export const logRunCompletedEvent = Effect.fn("logRunCompletedEvent")(function* (deathReason: "Forfeit" | "Guesses") {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(yield* Atom.get(runSessionRunIdAtom));
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(theSecretWordAtom);
  const failedOnWord = deathReason === "Guesses" ? theSecretWord : "N/A";
  const finalScore = yield* Atom.get(runSessionRunScoreAtom);
  const finalStreak = yield* Atom.get(runSessionStreakAtom);

  // We calculate the total real-world time the run was alive
  const now = yield* DateTime.now;
  const createdAt = Option.getOrElse(yield* Atom.get(runSessionCreatedAtAtom), () => now);
  const durationSeconds = DateTime.distance(createdAt, now).pipe(Duration.toSeconds, Math.floor);

  // Enrich the span itself with searchable attributes (stream 1 -> arcade_run_summary)
  yield* Effect.annotateCurrentSpan({ runId, sessionId, solutionsLanguage, deathReason, failedOnWord, finalScore, finalStreak, durationSeconds });
});

// Track metrics related to the action of submitting a new guess (stream 2 -> global_pulse)
export const trackSubmitGuessAction = Effect.fnUntraced(function* ({ currentGuessWord, currentTurn }: GameState) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const turnMachineSnapshot = yield* Atom.get(turnMachineAtom);

  // Track both invalid and valid guesses
  if (turnMachineSnapshot.matches("rejected")) {
    // Invalid guess has been made
    yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  } else {
    // Must have been a valid guess otherwise
    yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

    // Track the opening guess for the very first valid submission of the game
    if (currentTurn === 1) yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), currentGuessWord);
  }
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackStartNewRunAction = Effect.fnUntraced(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

  yield* Metric.update(runsStarted.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackForfeitRunAction = Effect.fnUntraced(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const runId = yield* Atom.get(runSessionRunIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const streak = yield* Atom.get(runSessionStreakAtom);

  // If the run has not started yet, there is nothing to track
  if (Option.isNone(runId)) return;

  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Forfeit");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompletedEvent("Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
export const trackWordWonEvent = Effect.fnUntraced(function* (gameState: GameState, wordScore: WordScore) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const guessedTurn = gameState.currentTurn - 1;

  yield* Metric.update(guessesToWin.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), guessedTurn);
  yield* Metric.update(timeToSolve.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), Math.floor(wordScore.timeSeconds));
  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(perfectGames.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWonEvent(gameState, wordScore);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLostEvent = Effect.fnUntraced(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const streak = yield* Atom.get(runSessionStreakAtom);
  const theSecretWord = yield* Atom.get(theSecretWordAtom);

  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(failedWords.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), theSecretWord);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompletedEvent("Guesses");
});
