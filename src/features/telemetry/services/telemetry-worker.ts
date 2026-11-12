// services, features, and other libraries
import { Array, Effect, Layer, Predicate, Stream, Duration, Match, Metric, Schedule, Schema, pipe } from "effect";
import { SecureRandom } from "effect/crypto/SecureRandom";
import { TelemetryHub } from "./telemetry-hub";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { AddArcadeRunSummary, AddGlobalPulse, AddRunWordEvent } from "@/features/telemetry/domain/models";

// types
import type { Tracer } from "effect";

// constants
import { SPAN_LOG_RUN_COMPLETED, SPAN_LOG_WORD_WON } from "@/features/telemetry/domain/constants";

// Metric counter/gauge state carries bigint on bigint-backed platforms, which JSON cannot encode
const bigIntToJson = (value: number | bigint) => (Predicate.isBigInt(value) ? value.toString() : value);

const normalizeMetricPayload = (snapshot: Metric.Metric.Snapshot) =>
  pipe(
    Match.value(snapshot),
    Match.when({ type: "Frequency" }, ({ state }) => ({ occurrences: Object.fromEntries(state.occurrences) })),
    Match.when({ type: "Counter" }, ({ state }) => ({ ...state, count: bigIntToJson(state.count) })),
    Match.when({ type: "Gauge" }, ({ state }) => ({ value: bigIntToJson(state.value) })),
    Match.orElse(({ state }) => state)
  );

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
const MetricPayloadFromJson = Schema.fromJsonString(Schema.Unknown);

// Schema.decodeUnknownEffect / Schema.encodeEffect build a parser on every call,
// so build them once at module scope instead of per telemetry event
const decodeRunWordEvent = Schema.decodeUnknownEffect(AddRunWordEvent);
const decodeArcadeRunSummary = Schema.decodeUnknownEffect(AddArcadeRunSummary);
const decodeGlobalPulse = Schema.decodeUnknownEffect(AddGlobalPulse);
const encodeMetricPayload = Schema.encodeEffect(MetricPayloadFromJson);

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;
    const { addGlobalPulse, addArcadeRunSummary, addRunWordEvent } = yield* RpcTelemetryClient;

    // Generate the unique identifier for this specific browser session/tab load
    // This lives in the closure of the worker and remains constant until the page reloads
    const { uuidV4 } = yield* SecureRandom;
    const instanceId = yield* uuidV4();

    // Decodes a span's attributes and forwards the event through the matching RPC
    const processSpan = (name: string, attributesObject: Record<string, unknown>) =>
      pipe(
        Match.value(name),
        Match.when(SPAN_LOG_WORD_WON, () => decodeRunWordEvent(attributesObject).pipe(Effect.flatMap(addRunWordEvent))),
        Match.when(SPAN_LOG_RUN_COMPLETED, () => decodeArcadeRunSummary(attributesObject).pipe(Effect.flatMap(addArcadeRunSummary))),
        Match.orElse(() => Effect.void)
      );

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = Effect.fnUntraced(function* (spanBatch: ReadonlyArray<Tracer.Span>) {
      if (!Array.isReadonlyArrayNonEmpty(spanBatch)) return;
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

    const processMetrics = Effect.fnUntraced(function* (snapshots: ReadonlyArray<Metric.Metric.Snapshot>) {
      if (!Array.isReadonlyArrayNonEmpty(snapshots)) return;
      yield* Effect.log("[TelemetryWorker] Received high-signal metric pulse.");

      // A snapshot that fails to decode is logged and skipped (Option.none)
      // so one malformed metric cannot kill the processor stream
      const globalPulseRecords = Array.getSomes(
        yield* Effect.forEach(snapshots, (snapshot) => {
          const { id: metricName, attributes } = snapshot;
          return encodeMetricPayload(normalizeMetricPayload(snapshot)).pipe(
            // We need to stringify the metric payload in order for equals to work (for stream deduping)
            Effect.flatMap((metricPayload) =>
              decodeGlobalPulse({
                sessionId: attributes?.["sessionId"],
                instanceId,
                solutionsLanguage: attributes?.["solutionsLanguage"],
                metricName,
                metricPayload,
              })
            ),
            Effect.tapError(Effect.logError),
            Effect.option
          );
        })
      );

      if (Array.isReadonlyArrayNonEmpty(globalPulseRecords)) {
        yield* addGlobalPulse(globalPulseRecords).pipe(
          // Same non-critical policy: log the failure and let the next pulse retry
          Effect.catchCause((cause) => Effect.logError("[TelemetryWorker] Failed to insert global pulses:", cause))
        );
      }
    });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(Stream.groupedWithin(50, Duration.seconds(5)), Stream.runForEach(processSpanBatch));

    // --- Stream 2: Metrics (Native Snapshot Loop via Stream) ---
    // We bypass the OTel bridge and talk directly to the Effect runtime for 100% accuracy
    // Declarative Stream alignment with spanProcessor: poll every 10s, dedup via `Stream.changes` (Equal.equals), no Ref
    const metricProcessor = pipe(
      Stream.fromEffectSchedule(Metric.snapshot, Schedule.spaced(Duration.seconds(10))),
      Stream.changes,
      Stream.runForEach(processMetrics)
    );

    // Run both processors in the background (Detach from parent scope). The
    // fibers are supervised with tapCause so a stream-level defect (which the
    // per-item catchCause guards cannot catch) is logged instead of dying
    // silently inside the scope
    yield* Effect.forkScoped(Effect.tapCause(spanProcessor, (cause) => Effect.logError("[TelemetryWorker] Span processor failed:", cause)));
    yield* Effect.forkScoped(Effect.tapCause(metricProcessor, (cause) => Effect.logError("[TelemetryWorker] Metric processor failed:", cause)));

    yield* Effect.log("[TelemetryWorker] Background telemetry processors started.");

    yield* Effect.addFinalizer(() => Effect.log("[TelemetryWorker] Background telemetry processors stopped."));
  })
);
