// services, features, and other libraries
import { Effect, Layer, Stream, Duration, Equal, Metric, Schedule, Schema } from "effect";
import { TelemetryHub } from "./telemetry-hub";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { AddArcadeRunSummary, AddGlobalPulse, AddRunWordEvent } from "@/features/telemetry/domain";
import { SolutionsLanguage } from "@/features/game/domain";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

const normalizeMetricPayload = (payload: Metric.Metric.Snapshot["state"]) => {
  if ("occurrences" in payload) return { occurrences: Object.fromEntries(payload.occurrences) };
  if ("incremental" in payload) return { ...payload, count: typeof payload.count === "bigint" ? payload.count.toString() : payload.count };
  if ("value" in payload) return { value: typeof payload.value === "bigint" ? payload.value.toString() : payload.value };

  return payload;
};

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;
    const { addGlobalPulse, addArcadeRunSummary, addRunWordEvent } = yield* RpcTelemetryClient;

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = (readableSpanBatch: ReadonlyArray<ReadableSpan>) =>
      Effect.gen(function* () {
        if (readableSpanBatch.length === 0) return;

        yield* Effect.logInfo(`[TelemetryWorker] Processing batch of ${readableSpanBatch.length} spans.`);

        for (const { name, attributes } of readableSpanBatch)
          if (name === "logWordWonEvent") yield* addRunWordEvent(Schema.decodeUnknownSync(AddRunWordEvent)(attributes));
          else if (name === "logRunCompletedEvent") yield* addArcadeRunSummary(Schema.decodeUnknownSync(AddArcadeRunSummary)(attributes));
      });

    const processMetrics = (snapshots: ReadonlyArray<Metric.Metric.Snapshot> = []) =>
      Effect.gen(function* () {
        yield* Effect.logInfo("[TelemetryWorker] Received high-signal metric pulse.");

        const globalPulseRecords: AddGlobalPulse[] = [];
        for (const { id: metricName, attributes, state: metricPayload } of snapshots) {
          const sessionId = Schema.decodeUnknownSync(Schema.Trim.check(Schema.isUUID()))(attributes?.["sessionId"]);
          const solutionsLanguage = Schema.decodeUnknownSync(SolutionsLanguage)(attributes?.["solutionsLanguage"]);
          globalPulseRecords.push({ sessionId, solutionsLanguage, metricName, metricPayload: JSON.stringify(normalizeMetricPayload(metricPayload)) });
        }
        if (globalPulseRecords.length > 0) yield* addGlobalPulse(globalPulseRecords);
      });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(
      Stream.flatMap((readableSpans: ReadableSpan[]) => Stream.fromIterable(readableSpans)),
      Stream.groupedWithin(50, Duration.seconds(5)),
      Stream.runForEach(processSpanBatch)
    );

    // --- Stream 2: Metrics (Native Snapshot Loop) ---
    // We bypass the OTel bridge and talk directly to the Effect runtime for 100% accuracy
    const metricProcessor = Effect.gen(function* () {
      let prevSnapshots: ReadonlyArray<Metric.Metric.Snapshot> = [];

      yield* Effect.repeat(
        Effect.gen(function* () {
          // Take a snapshot of all metrics
          const currSnapshots = yield* Metric.snapshot;

          // Effect v4 handles structural equality for snapshots (including Maps in Frequencies)
          if (!Equal.equals(currSnapshots, prevSnapshots)) {
            yield* processMetrics(currSnapshots);
            prevSnapshots = currSnapshots;
          }
        }),
        Schedule.spaced(Duration.seconds(10))
      );
    });

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkDetach(spanProcessor);
    yield* Effect.forkDetach(metricProcessor);

    yield* Effect.logInfo("[TelemetryWorker] Background telemetry processors started.");
  })
).pipe(Layer.provide(RpcTelemetryClient.layer));
