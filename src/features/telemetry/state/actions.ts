// services, features, and other libraries
import { DateTime, Duration, Effect, Metric, Number, Option } from "effect";
import { Atom } from "effect/reactivity";
import { metrics } from "@/features/telemetry/domain/metrics";
import { sessionIdAtom } from "@/features/player/state/player";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// types
import type { RunDeathReason, SolutionsLanguage } from "@/features/game/domain/models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";
import type { RunSession } from "@/features/game/machines/run-session/models";
type SharedAttributes = { readonly sessionId: string; readonly solutionsLanguage: SolutionsLanguage };

// constants
import { SPAN_LOG_RUN_COMPLETED, SPAN_LOG_WORD_WON } from "@/features/telemetry/domain/constants";

// The turn the player actually guessed on (the machine increments `currentTurn` on submit)
const guessedTurnOf = (wordChallenge: WordChallenge) => wordChallenge.currentTurn - 1;

// The attribute pair every tracker annotates its span/metric with: the current session id and the active solutions language
const sharedAttributes = Effect.fnUntraced(function* () {
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  return { sessionId, solutionsLanguage } as const;
});

// Record one update against a metric, tagged with the current session attributes
const trackMetric = <Input>(attributes: SharedAttributes, metric: Metric.Metric<Input, unknown>, input: Input) =>
  Metric.update(metric.pipe(Metric.withAttributes(attributes)), input);

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
// All three fields are required for the span; if any is absent the annotation is skipped instead of failing
export const logWordWon = Effect.fn(SPAN_LOG_WORD_WON)(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const { solutionsLanguage } = yield* sharedAttributes();
  const guessedTurn = guessedTurnOf(wordChallenge);

  const details = Option.all({ runId: runSession.runId, theSecretWord: wordChallenge.theSecretWord, wordScore: wordChallenge.wordScore });
  if (Option.isSome(details)) {
    const { runId, theSecretWord, wordScore } = details.value;
    yield* Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: wordScore.timeSeconds });
  }
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
// `runId` is always required; `theSecretWord` is only needed for "Guesses" deaths, so a missing secret word
// degrades to "N/A" instead of failing the entire span annotation
export const logRunCompleted = Effect.fn(SPAN_LOG_RUN_COMPLETED)(function* (runSession: RunSession, wordChallenge: WordChallenge, deathReason: RunDeathReason) {
  const { sessionId, solutionsLanguage } = yield* sharedAttributes();
  const finalScore = runSession.runScore;
  const finalStreak = runSession.streak;

  // We calculate the total real-world time the run was alive, clamped at 0 so a
  // persisted `createdAt` ahead of the current clock (skew, tampering) cannot make
  // the duration negative — `AddArcadeRunSummary` rejects negatives, which would
  // drop the whole run summary downstream. The upper bound is `Infinity` ("none
  // to enforce"), and `clamp` still folds a non-finite duration into the same
  // floor rather than letting `NaN` reach the schema
  const now = yield* DateTime.now;
  const createdAt = Option.getOrElse(runSession.createdAt, () => now);
  const durationSeconds = Number.clamp({ minimum: 0, maximum: Infinity })(DateTime.distance(createdAt, now).pipe(Duration.toSeconds, Math.floor));

  if (Option.isSome(runSession.runId)) {
    yield* Effect.annotateCurrentSpan({
      runId: runSession.runId.value,
      sessionId,
      solutionsLanguage,
      deathReason,
      // The secret word is only meaningful for "Guesses" deaths; every other
      // death reason (and a puzzle that never had one) degrades to "N/A"
      failedOnWord: deathReason === "Guesses" ? Option.getOrElse(wordChallenge.theSecretWord, () => "N/A") : "N/A",
      finalScore,
      finalStreak,
      durationSeconds,
    });
  }
});

// Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
export const trackInvalidGuessSubmitted = Effect.fnUntraced(function* () {
  const attributes = yield* sharedAttributes();
  yield* trackMetric(attributes, metrics.invalidGuesses, 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
export const trackValidGuessSubmitted = Effect.fnUntraced(function* (wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes();
  const currentGuessWord = wordChallenge.currentGuessWord;
  const currentTurn = wordChallenge.currentTurn;

  yield* trackMetric(attributes, metrics.validGuesses, 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* trackMetric(attributes, metrics.openingGuesses, currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
export const trackStartedNewRun = Effect.fnUntraced(function* () {
  const attributes = yield* sharedAttributes();
  yield* trackMetric(attributes, metrics.runsStarted, 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
export const trackForfeitedRun = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes();
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
  const attributes = yield* sharedAttributes();
  const guessedTurn = guessedTurnOf(wordChallenge);

  yield* trackMetric(attributes, metrics.guessesToWin, guessedTurn);

  // `timeToSolve` needs the volatile word score, which may be absent; skip it gracefully instead of failing
  if (Option.isSome(wordChallenge.wordScore)) {
    yield* trackMetric(attributes, metrics.timeToSolve, wordChallenge.wordScore.value.timeSeconds);
  }

  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  if (guessedTurn === 1) yield* trackMetric(attributes, metrics.perfectGames, 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon(runSession, wordChallenge);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
export const trackWordLost = Effect.fnUntraced(function* (runSession: RunSession, wordChallenge: WordChallenge) {
  const attributes = yield* sharedAttributes();
  const streak = runSession.streak;

  // Same policy as trackForfeitedRun: a loss without a started run has nothing to track
  if (Option.isNone(runSession.runId)) return;

  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  yield* trackMetric(attributes, metrics.arcadeRunLength, streak);

  // `failedWords` needs the secret word; skip it if the puzzle never had one
  if (Option.isSome(wordChallenge.theSecretWord)) {
    yield* trackMetric(attributes, metrics.failedWords, wordChallenge.theSecretWord.value);
  }

  yield* trackMetric(attributes, metrics.runDeathReason, "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(runSession, wordChallenge, "Guesses");
});
