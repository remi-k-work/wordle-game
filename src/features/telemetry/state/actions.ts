// services, features, and other libraries
import { DateTime, Duration, Effect, Metric, Option } from "effect";
import { Atom } from "effect/reactivity";
import { metrics } from "@/features/telemetry/domain/metrics";
import { sessionIdAtom } from "@/features/player/state/player";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// types
import type { RunDeathReason, RunSession, WordChallenge } from "@/features/game/domain/models";
type SharedAttributes = Effect.Success<typeof sharedAttributes>;

// The attribute pair every tracker annotates its span/metric with: the current session id and the active solutions language
const sharedAttributes = Effect.gen(function* () {
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  return { sessionId, solutionsLanguage } as const;
});

// Record one update against a metric, tagged with the current session attributes
const trackMetric = <Input>(attributes: SharedAttributes, metric: Metric.Metric<Input, unknown>, input: Input) =>
  Metric.update(metric.pipe(Metric.withAttributes(attributes)), input);

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
export const logWordWon = Effect.fn("logWordWon")(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = yield* Effect.fromOption(runSession.runId);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  const theSecretWord = yield* Effect.fromOption(wordChallenge.theSecretWord);
  const currentTurn = wordChallenge.currentTurn;
  const wordScore = yield* Effect.fromOption(wordChallenge.wordScore);
  const guessedTurn = currentTurn - 1;

  // Enrich the span itself with searchable attributes (stream 1 -> run_word_event)
  yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: Math.floor(wordScore.timeSeconds) });
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
export const logRunCompleted = Effect.fn("logRunCompleted")(function* (runSession: RunSession, wordChallenge: WordChallenge, deathReason: RunDeathReason) {
  // Extract all the necessary attributes that will offer additional context for our span
  const runId = yield* Effect.fromOption(runSession.runId);
  const { sessionId, solutionsLanguage } = yield* sharedAttributes;
  const theSecretWord = yield* Effect.fromOption(wordChallenge.theSecretWord);
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
  const attributes = yield* sharedAttributes;
  yield* trackMetric(attributes, metrics.invalidGuesses, 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
export const trackValidGuessSubmitted = Effect.fnUntraced(function* (wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes;
  const currentGuessWord = wordChallenge.currentGuessWord;
  const currentTurn = wordChallenge.currentTurn;

  yield* trackMetric(attributes, metrics.validGuesses, 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* trackMetric(attributes, metrics.openingGuesses, currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackStartedNewRun = Effect.gen(function* () {
  const attributes = yield* sharedAttributes;
  yield* trackMetric(attributes, metrics.runsStarted, 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackForfeitedRun = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes;
  const runId = runSession.runId;
  const streak = runSession.streak;

  // If the run has not started yet, there is nothing to track
  if (Option.isNone(runId)) return;

  yield* trackMetric(attributes, metrics.arcadeRunLength, streak);
  yield* trackMetric(attributes, metrics.runDeathReason, "Forfeit");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSession, wordChallenge, "Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
export const trackWordWon = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes;
  const currentTurn = wordChallenge.currentTurn;
  const wordScore = yield* Effect.fromOption(wordChallenge.wordScore);
  const guessedTurn = currentTurn - 1;

  yield* trackMetric(attributes, metrics.guessesToWin, guessedTurn);
  yield* trackMetric(attributes, metrics.timeToSolve, Math.floor(wordScore.timeSeconds));
  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  if (guessedTurn === 1) yield* trackMetric(attributes, metrics.perfectGames, 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon(runSession, wordChallenge);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLost = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes;
  const streak = runSession.streak;
  const theSecretWord = yield* Effect.fromOption(wordChallenge.theSecretWord);

  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  yield* trackMetric(attributes, metrics.arcadeRunLength, streak);
  yield* trackMetric(attributes, metrics.failedWords, theSecretWord);
  yield* trackMetric(attributes, metrics.runDeathReason, "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSession, wordChallenge, "Guesses");
});
