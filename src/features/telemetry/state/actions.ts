// services, features, and other libraries
import { DateTime, Duration, Effect, Metric, Option } from "effect";
import { Atom, AtomRegistry } from "effect/unstable/reactivity";
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
  wordChallengeCurrentGuessWordAtom,
  wordChallengeCurrentTurnAtom,
  wordChallengeTheSecretWordAtom,
  wordChallengeWordScoreAtom,
} from "@/features/game/state";
import { solutionsLanguageAtom } from "@/features/settings/state";

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
export const logWordWon = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(yield* Atom.get(runSessionRunIdAtom));
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(wordChallengeTheSecretWordAtom);
  const currentTurn = yield* Atom.get(wordChallengeCurrentTurnAtom);
  const wordScore = Option.getOrThrow(yield* Atom.get(wordChallengeWordScoreAtom));
  const guessedTurn = currentTurn - 1;

  // Enrich the span itself with searchable attributes (stream 1 -> run_word_event)
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: Math.floor(wordScore.timeSeconds) });
}).pipe(Effect.withSpan("logWordWon"));

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
export const logRunCompleted = Effect.fn("logRunCompleted")(function* (deathReason: "Forfeit" | "Guesses") {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = Option.getOrThrow(yield* Atom.get(runSessionRunIdAtom));
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const theSecretWord = yield* Atom.get(wordChallengeTheSecretWordAtom);
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

// Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
export const trackInvalidGuessSubmitted = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

  yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
export const trackValidGuessSubmitted = Effect.gen(function* (): Generator<Effect.Effect<void, never, AtomRegistry.AtomRegistry>> {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const currentGuessWord = yield* Atom.get(wordChallengeCurrentGuessWordAtom);
  const currentTurn = yield* Atom.get(wordChallengeCurrentTurnAtom);

  yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackNewRunStarted = Effect.gen(function* () {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

  yield* Metric.update(runsStarted.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackRunForfeited = Effect.gen(function* () {
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
  yield* logRunCompleted("Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
export const trackWordWon = Effect.gen(function* (): Generator<Effect.Effect<void, never, AtomRegistry.AtomRegistry>> {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const currentTurn = yield* Atom.get(wordChallengeCurrentTurnAtom);
  const wordScore = Option.getOrThrow(yield* Atom.get(wordChallengeWordScoreAtom));
  const guessedTurn = currentTurn - 1;

  yield* Metric.update(guessesToWin.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), guessedTurn);
  yield* Metric.update(timeToSolve.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), Math.floor(wordScore.timeSeconds));
  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  if (guessedTurn === 1) yield* Metric.update(perfectGames.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon;
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLost = Effect.gen(function* (): Generator<Effect.Effect<void, never, AtomRegistry.AtomRegistry>> {
  // Extract all the necessary attributes that will offer additional context for our metrics
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
  const streak = yield* Atom.get(runSessionStreakAtom);
  const theSecretWord = yield* Atom.get(wordChallengeTheSecretWordAtom);

  yield* Metric.update(gamesPlayed.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), 1);
  yield* Metric.update(arcadeRunLength.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), streak);
  yield* Metric.update(failedWords.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), theSecretWord);
  yield* Metric.update(runDeathReason.pipe(Metric.withAttributes({ sessionId, solutionsLanguage })), "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted("Guesses");
});
