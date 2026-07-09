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
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// types
import type { RunSessionMachineContext } from "@/features/game/machines/run-session";
import type { WordChallengeMachineContext } from "@/features/game/machines/word-challenge";

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
export const logWordWon = Effect.fn("logWordWon")(function* (
  runSessionMachineContext: RunSessionMachineContext,
  wordChallengeMachineContext: WordChallengeMachineContext
) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(runSessionMachineContext.runId);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const theSecretWord = Option.getOrThrow(wordChallengeMachineContext.theSecretWord);
  const currentTurn = wordChallengeMachineContext.currentTurn;
  const wordScore = Option.getOrThrow(wordChallengeMachineContext.wordScore);
  const guessedTurn = currentTurn - 1;

  // Enrich the span itself with searchable attributes (stream 1 -> run_word_event)
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: Math.floor(wordScore.timeSeconds) });
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
export const logRunCompleted = Effect.fn("logRunCompleted")(function* (
  runSessionMachineContext: RunSessionMachineContext,
  wordChallengeMachineContext: WordChallengeMachineContext,
  deathReason: "Forfeit" | "Guesses"
) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(runSessionMachineContext.runId);
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const theSecretWord = Option.getOrThrow(wordChallengeMachineContext.theSecretWord);
  const failedOnWord = deathReason === "Guesses" ? theSecretWord : "N/A";
  const finalScore = runSessionMachineContext.runScore;
  const finalStreak = runSessionMachineContext.streak;

  // We calculate the total real-world time the run was alive
  const now = yield* DateTime.now;
  const createdAt = Option.getOrElse(runSessionMachineContext.createdAt, () => now);
  const durationSeconds = DateTime.distance(createdAt, now).pipe(Duration.toSeconds, Math.floor);

  // Enrich the span itself with searchable attributes (stream 1 -> arcade_run_summary)
  yield* Effect.annotateCurrentSpan({ runId, sessionId, solutionsLanguage, deathReason, failedOnWord, finalScore, finalStreak, durationSeconds });
});

// Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
export const trackInvalidGuessSubmitted = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

  yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
export const trackValidGuessSubmitted = Effect.fnUntraced(function* (wordChallengeMachineContext: WordChallengeMachineContext) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const currentGuessWord = wordChallengeMachineContext.currentGuessWord;
  const currentTurn = wordChallengeMachineContext.currentTurn;

  yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackStartedNewRun = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

  yield* Metric.update(runsStarted.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackForfeitedRun = Effect.fnUntraced(function* (
  runSessionMachineContext: RunSessionMachineContext,
  wordChallengeMachineContext: WordChallengeMachineContext
) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const runId = runSessionMachineContext.runId;
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const streak = runSessionMachineContext.streak;

  // If the run has not started yet, there is nothing to track
  if (Option.isNone(runId)) return;

  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Forfeit");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSessionMachineContext, wordChallengeMachineContext, "Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
export const trackWordWon = Effect.fnUntraced(function* (
  runSessionMachineContext: RunSessionMachineContext,
  wordChallengeMachineContext: WordChallengeMachineContext
) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const currentTurn = wordChallengeMachineContext.currentTurn;
  const wordScore = Option.getOrThrow(wordChallengeMachineContext.wordScore);
  const guessedTurn = currentTurn - 1;

  yield* Metric.update(guessesToWin.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), guessedTurn);
  yield* Metric.update(timeToSolve.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), Math.floor(wordScore.timeSeconds));
  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(perfectGames.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon(runSessionMachineContext, wordChallengeMachineContext);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLost = Effect.fnUntraced(function* (
  runSessionMachineContext: RunSessionMachineContext,
  wordChallengeMachineContext: WordChallengeMachineContext
) {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const streak = runSessionMachineContext.streak;
  const theSecretWord = Option.getOrThrow(wordChallengeMachineContext.theSecretWord);

  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(failedWords.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), theSecretWord);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSessionMachineContext, wordChallengeMachineContext, "Guesses");
});
