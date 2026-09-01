// services, features, and other libraries
import { Effect, Layer, Stream, Duration, Equal, Match, Metric, Ref, Schedule, Schema, pipe } from "effect";
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

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;
    const { addGlobalPulse, addArcadeRunSummary, addRunWordEvent } = yield* RpcTelemetryClient;

    // Generate the unique identifier for this specific browser session/tab load
    // This lives in the closure of the worker and remains constant until the page reloads
    const instanceId = crypto.randomUUID();

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = (spanBatch: ReadonlyArray<Tracer.Span>) =>
      Effect.gen(function* () {
        if (spanBatch.length === 0) return;
        yield* Effect.log(`[TelemetryWorker] Processing batch of ${spanBatch.length} spans.`);

        for (const { name, attributes } of spanBatch) {
          // Convert the attributes map to a plain object for schema decoding and validation
          const attributesObject = Object.fromEntries(attributes);

          yield* pipe(
            Match.value(name),
            Match.when("logWordWon", () => Effect.asVoid(addRunWordEvent(Schema.decodeUnknownSync(AddRunWordEvent)(attributesObject)))),
            Match.when("logRunCompleted", () => Effect.asVoid(addArcadeRunSummary(Schema.decodeUnknownSync(AddArcadeRunSummary)(attributesObject)))),
            Match.orElse(() => Effect.void)
          );
        }
      });

    const processMetrics = (snapshots: ReadonlyArray<Metric.Metric.Snapshot> = []) =>
      Effect.gen(function* () {
        if (snapshots.length === 0) return;
        yield* Effect.log("[TelemetryWorker] Received high-signal metric pulse.");

        const globalPulseRecords: AddGlobalPulse[] = [];
        for (const { id: metricName, attributes, state: metricPayload } of snapshots) {
          const sessionId = Schema.decodeUnknownSync(Schema.Trim.check(Schema.isUUID()))(attributes?.["sessionId"]);
          const solutionsLanguage = Schema.decodeUnknownSync(SolutionsLanguage)(attributes?.["solutionsLanguage"]);
          globalPulseRecords.push({
            sessionId,
            instanceId,
            solutionsLanguage,
            metricName,
            metricPayload: JSON.stringify(normalizeMetricPayload(metricPayload)),
          });
        }
        if (globalPulseRecords.length > 0) yield* addGlobalPulse(globalPulseRecords);
      });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(Stream.groupedWithin(50, Duration.seconds(5)), Stream.runForEach(processSpanBatch));

    // --- Stream 2: Metrics (Native Snapshot Loop) ---
    // We bypass the OTel bridge and talk directly to the Effect runtime for 100% accuracy
    const metricProcessor = Effect.gen(function* () {
      const prevSnapshots = yield* Ref.make<ReadonlyArray<Metric.Metric.Snapshot>>([]);

      yield* Effect.repeat(
        Effect.gen(function* () {
          // Take a snapshot of all metrics
          const currSnapshots = yield* Metric.snapshot;

          // Effect v4 handles structural equality for snapshots (including Maps in Frequencies)
          if (!Equal.equals(currSnapshots, yield* Ref.get(prevSnapshots))) {
            yield* processMetrics(currSnapshots);
            yield* Ref.set(prevSnapshots, currSnapshots);
          }
        }),
        Schedule.spaced(Duration.seconds(10))
      );
    });

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkScoped(spanProcessor);
    yield* Effect.forkScoped(metricProcessor);

    yield* Effect.log("[TelemetryWorker] Background telemetry processors started.");

    yield* Effect.addFinalizer(() => Effect.log("[TelemetryWorker] Background telemetry processors stopped."));
  })
);
