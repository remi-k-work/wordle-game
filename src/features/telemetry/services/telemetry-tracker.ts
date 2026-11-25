// services, features, and other libraries
import { Context, DateTime, Duration, Effect, Layer, Metric, Number, Option } from "effect";
import { metrics } from "@/features/telemetry/domain/metrics";

// types
import type { RunDeathReason, SolutionsLanguage } from "@/features/game/domain/models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";
import type { RunSession } from "@/features/game/machines/run-session/models";

// What the tracker needs from application state. The caller reads it at the moment of tracking, so the service itself never touches the atoms
export type TelemetryAttributes = {
  readonly sessionId: string;
  readonly solutionsLanguage: SolutionsLanguage;
};

// constants
import { SPAN_LOG_RUN_COMPLETED, SPAN_LOG_WORD_WON } from "@/features/telemetry/domain/constants";

// The turn the player actually guessed on (the machine increments `currentTurn` on submit)
const guessedTurnOf = (wordChallenge: WordChallenge) => wordChallenge.currentTurn - 1;

// Record one update against a metric, tagged with the caller's current session attributes
const trackMetric = <Input>(attributes: TelemetryAttributes, metric: Metric.Metric<Input, unknown>, input: Input) =>
  Metric.update(metric.pipe(Metric.withAttributes(attributes)), input);

// Run `f` with the present value and do nothing when the option is absent;
// keeps the "skip if absent" policy in one place
const whenSome = <A>(option: Option.Option<A>, f: (value: A) => Effect.Effect<void>): Effect.Effect<void> =>
  Option.match(option, { onNone: () => Effect.void, onSome: f });

// This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
// All three fields are required for the span; if any is absent the annotation is skipped instead of failing
const logWordWon = Effect.fn(SPAN_LOG_WORD_WON)(function* (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) {
  const { solutionsLanguage } = attributes;
  const guessedTurn = guessedTurnOf(wordChallenge);

  yield* whenSome(
    Option.all({ runId: runSession.runId, theSecretWord: wordChallenge.theSecretWord, wordScore: wordChallenge.wordScore }),
    ({ runId, theSecretWord, wordScore }) =>
      Effect.annotateCurrentSpan({ runId, solutionsLanguage, theSecretWord, guessedTurn, timeSeconds: wordScore.timeSeconds })
  );
});

// A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
// `runId` is always required; `theSecretWord` is only needed for "Guesses" deaths, so a missing secret word
// degrades to "N/A" instead of failing the entire span annotation
const logRunCompleted = Effect.fn(SPAN_LOG_RUN_COMPLETED)(function* (
  attributes: TelemetryAttributes,
  runSession: RunSession,
  wordChallenge: WordChallenge,
  deathReason: RunDeathReason
) {
  const { sessionId, solutionsLanguage } = attributes;
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

  yield* whenSome(runSession.runId, (runId) =>
    Effect.annotateCurrentSpan({
      runId,
      sessionId,
      solutionsLanguage,
      deathReason,
      // The secret word is only meaningful for "Guesses" deaths; every other death reason (and a puzzle that never had one) degrades to "N/A"
      failedOnWord: deathReason === "Guesses" ? Option.getOrElse(wordChallenge.theSecretWord, () => "N/A") : "N/A",
      finalScore,
      finalStreak,
      durationSeconds,
    })
  );
});

// Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
const trackInvalidGuessSubmitted = Effect.fnUntraced(function* (attributes: TelemetryAttributes) {
  yield* trackMetric(attributes, metrics.invalidGuesses, 1);
});

// Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
const trackValidGuessSubmitted = Effect.fnUntraced(function* (attributes: TelemetryAttributes, wordChallenge: WordChallenge) {
  const currentGuessWord = wordChallenge.currentGuessWord;
  const currentTurn = wordChallenge.currentTurn;

  yield* trackMetric(attributes, metrics.validGuesses, 1);

  // Track the opening guess for the very first valid submission of the game
  if (currentTurn === 1) yield* trackMetric(attributes, metrics.openingGuesses, currentGuessWord);
});

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
const trackStartedNewRun = Effect.fnUntraced(function* (attributes: TelemetryAttributes) {
  yield* trackMetric(attributes, metrics.runsStarted, 1);
});

// Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
const trackForfeitedRun = Effect.fnUntraced(function* (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) {
  const runId = runSession.runId;
  const streak = runSession.streak;

  // If the run has not started yet, there is nothing to track
  if (Option.isNone(runId)) return;

  yield* trackMetric(attributes, metrics.arcadeRunLength, streak);
  yield* trackMetric(attributes, metrics.runDeathReason, "Forfeit");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(attributes, runSession, wordChallenge, "Forfeit");
});

// Track metrics related to the event of winning the game (stream 2 -> global_pulse)
const trackWordWon = Effect.fnUntraced(function* (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) {
  const guessedTurn = guessedTurnOf(wordChallenge);

  yield* trackMetric(attributes, metrics.guessesToWin, guessedTurn);

  // `timeToSolve` needs the volatile word score, which may be absent; skip it gracefully instead of failing
  yield* whenSome(wordChallenge.wordScore, (wordScore) => trackMetric(attributes, metrics.timeToSolve, wordScore.timeSeconds));

  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  if (guessedTurn === 1) yield* trackMetric(attributes, metrics.perfectGames, 1);

  // This function logs the exact details of an event when a player wins the game (stream 1 -> run_word_event)
  yield* logWordWon(attributes, runSession, wordChallenge);
});

// Track metrics related to the event of losing the game (stream 2 -> global_pulse)
const trackWordLost = Effect.fnUntraced(function* (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) {
  const streak = runSession.streak;

  // Same policy as trackForfeitedRun: a loss without a started run has nothing to track
  if (Option.isNone(runSession.runId)) return;

  yield* trackMetric(attributes, metrics.gamesPlayed, 1);
  yield* trackMetric(attributes, metrics.arcadeRunLength, streak);

  // `failedWords` needs the secret word; skip it if the puzzle never had one
  yield* whenSome(wordChallenge.theSecretWord, (theSecretWord) => trackMetric(attributes, metrics.failedWords, theSecretWord));

  yield* trackMetric(attributes, metrics.runDeathReason, "Guesses");

  // A function to log the exact details of a completed arcade run session (stream 1 -> arcade_run_summary)
  yield* logRunCompleted(attributes, runSession, wordChallenge, "Guesses");
});

// Single surface for every telemetry event; the caller passes the current session attributes, so the layer has no state dependency and stays pure
export class TelemetryTracker extends Context.Service<
  TelemetryTracker,
  {
    readonly trackStartedNewRun: (attributes: TelemetryAttributes) => Effect.Effect<void>;
    readonly trackForfeitedRun: (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) => Effect.Effect<void>;
    readonly trackValidGuessSubmitted: (attributes: TelemetryAttributes, wordChallenge: WordChallenge) => Effect.Effect<void>;
    readonly trackInvalidGuessSubmitted: (attributes: TelemetryAttributes) => Effect.Effect<void>;
    readonly trackWordWon: (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) => Effect.Effect<void>;
    readonly trackWordLost: (attributes: TelemetryAttributes, runSession: RunSession, wordChallenge: WordChallenge) => Effect.Effect<void>;
  }
>()("TelemetryTracker") {
  static readonly layer = Layer.succeed(
    TelemetryTracker,
    TelemetryTracker.of({
      trackStartedNewRun,
      trackForfeitedRun,
      trackValidGuessSubmitted,
      trackInvalidGuessSubmitted,
      trackWordWon,
      trackWordLost,
    })
  );

  // Test-only: every method is a no-op, so a test can provide the tracker
  // without recording metrics or emitting spans.
  static readonly layerTest = Layer.succeed(
    TelemetryTracker,
    TelemetryTracker.of({
      trackStartedNewRun: () => Effect.void,
      trackForfeitedRun: () => Effect.void,
      trackValidGuessSubmitted: () => Effect.void,
      trackInvalidGuessSubmitted: () => Effect.void,
      trackWordWon: () => Effect.void,
      trackWordLost: () => Effect.void,
    })
  );
}
