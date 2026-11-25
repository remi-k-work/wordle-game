// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, HashSet, Layer, Metric, Option, Tracer } from "effect";
import { TelemetryTracker } from "@/features/telemetry/services/telemetry-tracker";
import { metrics } from "@/features/telemetry/domain/metrics";

// types
import type { TelemetryAttributes } from "@/features/telemetry/services/telemetry-tracker";
import type { RunSession } from "@/features/game/machines/run-session/models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";

// constants
import { SPAN_LOG_RUN_COMPLETED, SPAN_LOG_WORD_WON } from "@/features/telemetry/domain/constants";

const SESSION_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const RUN_ID = "550e8400-e29b-41d4-a716-446655440000";

const attributes: TelemetryAttributes = { sessionId: SESSION_ID, solutionsLanguage: "En" };

const runSession: RunSession = {
  runId: Option.some(RUN_ID),
  createdAt: Option.some(DateTime.makeUnsafe("2025-09-01T12:00:00Z")),
  runScore: 42,
  streak: 3,
  bestRunScore: 50,
  bestStreak: 4,
};

const wordChallenge: WordChallenge = {
  dictionary: Option.none(),
  theSecretWord: Option.some("APPLE"),
  currentGuessWord: "APPLE",
  wordleGuesses: [],
  currentTurn: 3,
  startTime: Option.some(DateTime.makeUnsafe("2025-09-01T12:00:00Z")),
  wordScore: Option.some({ wordScore: 100, basePointsPerTurn: 10, speedMultiplier: 1.5, timeSeconds: 42 }),
  greyLetters: HashSet.empty(),
};

// Each case gets a fresh metric registry and a recording tracer, so assertions
// see only the metrics and spans the tracker emitted for that case.
const withHarness = <A, E>(
  layer: Layer.Layer<TelemetryTracker>,
  makeEffect: (spans: Array<Tracer.Span>) => Effect.Effect<A, E, TelemetryTracker>
) => {
  const spans: Array<Tracer.Span> = [];
  const tracer = Tracer.make({
    span: (options) => {
      const span = new Tracer.NativeSpan(options);
      spans.push(span);
      return span;
    },
  });

  return makeEffect(spans).pipe(
    Effect.provide(layer),
    Effect.provideService(Tracer.Tracer, tracer),
    Effect.provideService(Metric.MetricRegistry, new Map())
  );
};

// `Metric.Snapshot` is not exported by the package's declaration file, so derive
// the snapshot type from the `Metric.snapshot` effect instead.
type MetricSnapshot = Effect.Success<typeof Metric.snapshot>[number];

const snapshotById = (snapshots: ReadonlyArray<MetricSnapshot>, id: string) =>
  snapshots.find((snapshot) => snapshot.id === id);

const counterCount = (snapshots: ReadonlyArray<MetricSnapshot>, id: string) => {
  const snapshot = snapshotById(snapshots, id);
  return snapshot?.type === "Counter" ? snapshot.state.count : undefined;
};

const histogramSum = (snapshots: ReadonlyArray<MetricSnapshot>, id: string) => {
  const snapshot = snapshotById(snapshots, id);
  return snapshot?.type === "Histogram" ? snapshot.state.sum : undefined;
};

const frequencyCount = (snapshots: ReadonlyArray<MetricSnapshot>, id: string, value: string) => {
  const snapshot = snapshotById(snapshots, id);
  return snapshot?.type === "Frequency" ? snapshot.state.occurrences.get(value) : undefined;
};

describe("TelemetryTracker", () => {
  it.effect("trackWordWon records the win metrics and the logWordWon span", () =>
    withHarness(TelemetryTracker.layer, (spans) =>
      Effect.gen(function* () {
        const tracker = yield* TelemetryTracker;
        yield* tracker.trackWordWon(attributes, runSession, wordChallenge);

        const snapshots = yield* Metric.snapshot;

        // The machine increments `currentTurn` on submit, so turn 3 means two guesses
        expect(histogramSum(snapshots, metrics.guessesToWin.id)).toBe(2);
        expect(histogramSum(snapshots, metrics.timeToSolve.id)).toBe(42);
        expect(counterCount(snapshots, metrics.gamesPlayed.id)).toBe(1);
        expect(counterCount(snapshots, metrics.perfectGames.id)).toBeUndefined();

        // Every metric carries the caller's attributes
        expect(snapshotById(snapshots, metrics.gamesPlayed.id)?.attributes).toStrictEqual({
          sessionId: SESSION_ID,
          solutionsLanguage: "En",
        });

        const span = spans.find((captured) => captured.name === SPAN_LOG_WORD_WON);
        expect(span?.attributes.get("runId")).toBe(RUN_ID);
        expect(span?.attributes.get("solutionsLanguage")).toBe("En");
        expect(span?.attributes.get("theSecretWord")).toBe("APPLE");
        expect(span?.attributes.get("guessedTurn")).toBe(2);
        expect(span?.attributes.get("timeSeconds")).toBe(42);
      })
    )
  );

  it.effect("trackForfeitedRun only records a run that has started", () =>
    withHarness(TelemetryTracker.layer, (spans) =>
      Effect.gen(function* () {
        const tracker = yield* TelemetryTracker;

        // Without a run id, neither metrics nor the completion span are emitted
        yield* tracker.trackForfeitedRun(attributes, { ...runSession, runId: Option.none() }, wordChallenge);
        expect(yield* Metric.snapshot).toHaveLength(0);
        expect(spans).toHaveLength(0);

        yield* tracker.trackForfeitedRun(attributes, runSession, wordChallenge);
        const snapshots = yield* Metric.snapshot;

        expect(histogramSum(snapshots, metrics.arcadeRunLength.id)).toBe(3);
        expect(frequencyCount(snapshots, metrics.runDeathReason.id, "Forfeit")).toBe(1);

        const span = spans.find((captured) => captured.name === SPAN_LOG_RUN_COMPLETED);
        expect(span?.attributes.get("sessionId")).toBe(SESSION_ID);
        expect(span?.attributes.get("deathReason")).toBe("Forfeit");
        expect(span?.attributes.get("failedOnWord")).toBe("N/A");
        expect(span?.attributes.get("finalScore")).toBe(42);
        expect(span?.attributes.get("finalStreak")).toBe(3);
      })
    )
  );

  it.effect("trackValidGuessSubmitted counts the opening guess on the first turn", () =>
    withHarness(TelemetryTracker.layer, () =>
      Effect.gen(function* () {
        const tracker = yield* TelemetryTracker;

        yield* tracker.trackInvalidGuessSubmitted(attributes);
        yield* tracker.trackValidGuessSubmitted(attributes, { ...wordChallenge, currentTurn: 1, currentGuessWord: "CRANE" });

        const snapshots = yield* Metric.snapshot;

        expect(counterCount(snapshots, metrics.invalidGuesses.id)).toBe(1);
        expect(counterCount(snapshots, metrics.validGuesses.id)).toBe(1);
        expect(frequencyCount(snapshots, metrics.openingGuesses.id, "CRANE")).toBe(1);
      })
    )
  );

  it.effect("layerTest is a silent no-op", () =>
    withHarness(TelemetryTracker.layerTest, (spans) =>
      Effect.gen(function* () {
        const tracker = yield* TelemetryTracker;

        yield* tracker.trackStartedNewRun(attributes);
        yield* tracker.trackForfeitedRun(attributes, runSession, wordChallenge);
        yield* tracker.trackValidGuessSubmitted(attributes, wordChallenge);
        yield* tracker.trackInvalidGuessSubmitted(attributes);
        yield* tracker.trackWordWon(attributes, runSession, wordChallenge);
        yield* tracker.trackWordLost(attributes, runSession, wordChallenge);

        expect(yield* Metric.snapshot).toHaveLength(0);
        expect(spans).toHaveLength(0);
      })
    )
  );
});
