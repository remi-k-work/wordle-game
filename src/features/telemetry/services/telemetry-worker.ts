// services, features, and other libraries
import { Array, Effect, Layer, Stream, Duration, Equal, Match, Metric, Schedule, Schema, pipe, Crypto } from "effect";
import { TelemetryHub } from "./telemetry-hub";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { AddArcadeRunSummary, AddGlobalPulse, AddRunWordEvent } from "@/features/telemetry/domain/models";

// types
import type { Tracer } from "effect";

const normalizeMetricPayload = (snapshot: Metric.Metric.Snapshot) =>
  pipe(
    Match.value(snapshot),
    Match.when({ type: "Frequency" }, ({ state }) => ({ occurrences: Object.fromEntries(state.occurrences) })),
    Match.when({ type: "Counter" }, ({ state }) => ({
      ...state,
      count: typeof state.count === "bigint" ? state.count.toString() : state.count,
    })),
    Match.when({ type: "Gauge" }, ({ state }) => ({ value: typeof state.value === "bigint" ? state.value.toString() : state.value })),
    Match.orElse(({ state }) => state)
  );

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
const MetricPayloadFormJson = Schema.fromJsonString(Schema.Unknown);

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;
    const { addGlobalPulse, addArcadeRunSummary, addRunWordEvent } = yield* RpcTelemetryClient;

    // Generate the unique identifier for this specific browser session/tab load
    // This lives in the closure of the worker and remains constant until the page reloads
    const crypto = yield* Crypto.Crypto;
    const instanceId = yield* crypto.randomUUIDv4();

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = Effect.fnUntraced(function* (spanBatch: ReadonlyArray<Tracer.Span>) {
      if (spanBatch.length === 0) return;
      yield* Effect.log(`[TelemetryWorker] Processing batch of ${spanBatch.length} spans.`);

      // The span inserts are independent of each other, so don't serialize
      // them: run the whole batch concurrently instead of paying up to 50
      // sequential RPC round-trips (async-parallel)
      yield* Effect.forEach(
        spanBatch,
        ({ name, attributes }) =>
          // Convert the attributes map to a plain object for schema decoding and validation
          processSpan(name, Object.fromEntries(attributes)).pipe(
            // Telemetry is non-critical: a malformed event or a failed insert
            // is logged and dropped instead of killing the background stream
            // for the rest of the session
            Effect.catchCause((cause) => Effect.logError("[TelemetryWorker] Dropping span event:", cause))
          ),
        { concurrency: "unbounded" }
      );
    });

    // Decodes a span's attributes and forwards the event through the matching RPC
    const processSpan = (name: string, attributesObject: Record<string, unknown>) =>
      pipe(
        Match.value(name),
        Match.when("logWordWon", () => Schema.decodeUnknownEffect(AddRunWordEvent)(attributesObject).pipe(Effect.flatMap(addRunWordEvent))),
        Match.when("logRunCompleted", () => Schema.decodeUnknownEffect(AddArcadeRunSummary)(attributesObject).pipe(Effect.flatMap(addArcadeRunSummary))),
        Match.orElse(() => Effect.void)
      );

    const processMetrics = Effect.fnUntraced(function* (snapshots: ReadonlyArray<Metric.Metric.Snapshot> = []) {
      if (snapshots.length === 0) return;
      yield* Effect.log("[TelemetryWorker] Received high-signal metric pulse.");

      // A snapshot that fails to decode is logged and skipped (Option.none)
      // so one malformed metric cannot kill the processor stream
      const globalPulseRecords = Array.getSomes(
        yield* Effect.forEach(snapshots, (snapshot) =>
          Effect.gen(function* () {
            const { id: metricName, attributes } = snapshot;
            return yield* Schema.decodeUnknownEffect(AddGlobalPulse)({
              sessionId: attributes?.["sessionId"],
              instanceId,
              solutionsLanguage: attributes?.["solutionsLanguage"],
              metricName,
              // We need to stringify the metric payload in order for equals to work (for stream deduping)
              metricPayload: yield* Schema.encodeEffect(MetricPayloadFormJson)(normalizeMetricPayload(snapshot)),
            }).pipe(Effect.tapError(Effect.logError), Effect.option);
          })
        )
      );

      if (globalPulseRecords.length > 0) {
        yield* addGlobalPulse([...globalPulseRecords]).pipe(
          // Same non-critical policy: log the failure and let the next pulse retry
          Effect.catchCause((cause) => Effect.logError("[TelemetryWorker] Failed to insert global pulses:", cause))
        );
      }
    });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(Stream.groupedWithin(50, Duration.seconds(5)), Stream.runForEach(processSpanBatch));

    // --- Stream 2: Metrics (Native Snapshot Loop via Stream) ---
    // We bypass the OTel bridge and talk directly to the Effect runtime for 100% accuracy
    // Declarative Stream alignment with spanProcessor: poll every 10s, dedup via Equal.equals, no Ref
    const metricProcessor = pipe(
      Stream.fromEffectSchedule(Metric.snapshot, Schedule.spaced(Duration.seconds(10))),
      Stream.changesWith((a, b) => Equal.equals(a, b)),
      Stream.runForEach((snapshots) => processMetrics(snapshots))
    );

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkScoped(spanProcessor);
    yield* Effect.forkScoped(metricProcessor);

    yield* Effect.log("[TelemetryWorker] Background telemetry processors started.");

    yield* Effect.addFinalizer(() => Effect.log("[TelemetryWorker] Background telemetry processors stopped."));
  })
);
