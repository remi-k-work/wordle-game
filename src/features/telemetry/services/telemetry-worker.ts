// services, features, and other libraries
import { Effect, Layer, Stream, Duration, Equal, Match, Metric, Schedule, Schema, pipe } from "effect";
import { TelemetryHub } from "./telemetry-hub";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { AddArcadeRunSummary, AddGlobalPulse, AddRunWordEvent } from "@/features/telemetry/domain";
import { SolutionsLanguage } from "@/features/game/domain";

// types
import type { Tracer } from "effect";

const normalizeMetricPayload = (payload: Metric.Metric.Snapshot["state"]) =>
  pipe(
    Match.value(payload),
    Match.when(
      (state): state is Metric.FrequencyState => "occurrences" in state,
      ({ occurrences }) => ({ occurrences: Object.fromEntries(occurrences) })
    ),
    Match.when(
      (state): state is Metric.CounterState<number | bigint> => "incremental" in state,
      (state) => ({ ...state, count: typeof state.count === "bigint" ? state.count.toString() : state.count })
    ),
    Match.when(
      (state): state is Metric.GaugeState<number | bigint> => "value" in state,
      (state) => ({ value: typeof state.value === "bigint" ? state.value.toString() : state.value })
    ),
    Match.orElse((state) => state)
  );

// Session-id attribute schema, hoisted to module scope so it isn't rebuilt on every metric pulse
const SessionIdSchema = Schema.Trim.check(Schema.isUUID());

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;
    const { addGlobalPulse, addArcadeRunSummary, addRunWordEvent } = yield* RpcTelemetryClient;

    // Generate the unique identifier for this specific browser session/tab load
    // This lives in the closure of the worker and remains constant until the page reloads
    // NOTE: intentionally `crypto.randomUUID()` rather than the Effect `Random` module —
    // this Layer is composed into `Atom.context(...)` in runtime-client.ts, so any new
    // service requirement would break that composition for zero practical benefit here.
    const instanceId = crypto.randomUUID();

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = (spanBatch: ReadonlyArray<Tracer.Span>) =>
      Effect.gen(function* () {
        if (spanBatch.length === 0) return;
        yield* Effect.log(`[TelemetryWorker] Processing batch of ${spanBatch.length} spans.`);

        yield* Effect.forEach(spanBatch, ({ name, attributes }) =>
          Effect.gen(function* () {
            // Convert the attributes map to a plain object for schema decoding and validation
            const attributesObject = Object.fromEntries(attributes);

            yield* pipe(
              Match.value(name),
              Match.when("logWordWon", () =>
                Effect.gen(function* () {
                  const data = yield* Schema.decodeUnknownEffect(AddRunWordEvent)(attributesObject).pipe(Effect.orDie);
                  yield* addRunWordEvent(data);
                }).pipe(Effect.asVoid)
              ),
              Match.when("logRunCompleted", () =>
                Effect.gen(function* () {
                  const data = yield* Schema.decodeUnknownEffect(AddArcadeRunSummary)(attributesObject).pipe(Effect.orDie);
                  yield* addArcadeRunSummary(data);
                }).pipe(Effect.asVoid)
              ),
              Match.orElse(() => Effect.void)
            );
          })
        );
      });

    const processMetrics = (snapshots: ReadonlyArray<Metric.Metric.Snapshot> = []) =>
      Effect.gen(function* () {
        if (snapshots.length === 0) return;
        yield* Effect.log("[TelemetryWorker] Received high-signal metric pulse.");

        const globalPulseRecords: AddGlobalPulse[] = yield* Effect.forEach(snapshots, ({ id: metricName, attributes, state: metricPayload }) =>
          Effect.gen(function* () {
            const sessionId = yield* Schema.decodeUnknownEffect(SessionIdSchema)(attributes?.["sessionId"]);
            const solutionsLanguage = yield* Schema.decodeUnknownEffect(SolutionsLanguage)(attributes?.["solutionsLanguage"]);
            return {
              sessionId,
              instanceId,
              solutionsLanguage,
              metricName,
              metricPayload: JSON.stringify(normalizeMetricPayload(metricPayload)),
            } as const satisfies AddGlobalPulse;
          }).pipe(Effect.orDie)
        );

        if (globalPulseRecords.length > 0) yield* addGlobalPulse(globalPulseRecords);
      });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(Stream.groupedWithin(50, Duration.seconds(5)), Stream.runForEach(processSpanBatch));

    // --- Stream 2: Metrics (Native Snapshot Loop via Stream) ---
    // We bypass the OTel bridge and talk directly to the Effect runtime for 100% accuracy
    // Declarative Stream alignment with spanProcessor: poll every 10s, dedup via Equal.equals, no Ref
    const metricProcessor = pipe(
      Stream.fromEffectSchedule(Metric.snapshot, Schedule.spaced(Duration.seconds(10))),
      Stream.changesWith((a, b) => Equal.equals(a, b)),
      Stream.runForEach((snapshots) => processMetrics(snapshots ?? []))
    );

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkScoped(spanProcessor);
    yield* Effect.forkScoped(metricProcessor);

    yield* Effect.log("[TelemetryWorker] Background telemetry processors started.");

    yield* Effect.addFinalizer(() => Effect.log("[TelemetryWorker] Background telemetry processors stopped."));
  })
);
