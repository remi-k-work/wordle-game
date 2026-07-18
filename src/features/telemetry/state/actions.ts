// services, features, and other libraries
import { DateTime, Duration, Effect, Metric, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { metrics } from "@/features/telemetry/domain";
import { sessionIdAtom } from "@/features/player/state";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// types
import type { RunSession, WordChallenge } from "@/features/game/domain";

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
export const logWordWon = Effect.fn("logWordWon")(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(runSession.runId);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const theSecretWord = Option.getOrThrow(wordChallenge.theSecretWord);
  const currentTurn = wordChallenge.currentTurn;
  const wordScore = Option.getOrThrow(wordChallenge.wordScore);
  const guessedTurn = currentTurn - 1;

  // Enrich the span itself with searchable attributes (stream 1 -> run_word_event)
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: Math.floor(wordScore.timeSeconds) });
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
export const logRunCompleted = Effect.fn("logRunCompleted")(function* (
  runSession: RunSession,
  wordChallenge: WordChallenge,
  deathReason: "Forfeit" | "Guesses"
) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(runSession.runId);
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const theSecretWord = Option.getOrThrow(wordChallenge.theSecretWord);
  const failedOnWord = deathReason === "Guesses" ? theSecretWord : "N/A";
  const finalScore = runSession.runScore;
  const finalStreak = runSession.streak;

  // We calculate the total real-world time the run was alive
  const now = yield* DateTime.now;
  const createdAt = Option.getOrElse(runSession.createdAt, () => now);
  const durationSeconds = DateTime.distance(createdAt, now).pipe(Duration.toSeconds, Math.floor);

  // Enrich the span itself with searchable attributes (stream 1 -> arcade_run_summary)
  yield* Effect.annotateCurrentSpan({ runId, sessionId, solutionsLanguage, deathReason, failedOnWord, finalScore, finalStreak, durationSeconds });
});

// Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
export const trackInvalidGuessSubmitted = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

  yield* Metric.update(metrics.invalidGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
export const trackValidGuessSubmitted = Effect.fnUntraced(function* (wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const currentGuessWord = wordChallenge.currentGuessWord;
  const currentTurn = wordChallenge.currentTurn;

  yield* Metric.update(metrics.validGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* Metric.update(metrics.openingGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackStartedNewRun = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

  yield* Metric.update(metrics.runsStarted.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackForfeitedRun = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const runId = runSession.runId;
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const streak = runSession.streak;

  // If the run has not started yet, there is nothing to track
  if (Option.isNone(runId)) return;

  yield* Metric.update(metrics.arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(metrics.runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Forfeit");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSession, wordChallenge, "Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
export const trackWordWon = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const currentTurn = wordChallenge.currentTurn;
  const wordScore = Option.getOrThrow(wordChallenge.wordScore);
  const guessedTurn = currentTurn - 1;

  yield* Metric.update(metrics.guessesToWin.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), guessedTurn);
  yield* Metric.update(metrics.timeToSolve.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), Math.floor(wordScore.timeSeconds));
  yield* Metric.update(metrics.gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(metrics.perfectGames.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon(runSession, wordChallenge);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLost = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const streak = runSession.streak;
  const theSecretWord = Option.getOrThrow(wordChallenge.theSecretWord);

  yield* Metric.update(metrics.gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  yield* Metric.update(metrics.arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(metrics.failedWords.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), theSecretWord);
  yield* Metric.update(metrics.runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSession, wordChallenge, "Guesses");
});
