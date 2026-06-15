// services, features, and other libraries
import { Effect, Layer, Stream, Duration, Equal, Metric, Schedule } from "effect";
import { TelemetryHub } from "./telemetry-hub";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = (readableSpanBatch: ReadonlyArray<ReadableSpan>) =>
      Effect.gen(function* () {
        if (readableSpanBatch.length === 0) return;

        yield* Effect.logInfo(`[TelemetryWorker] Processing batch of ${readableSpanBatch.length} spans.`);

        for (const { name, attributes } of readableSpanBatch) {
          yield* Effect.log(`  -> Span: "${name}"`, { attributes });
        }
      });

    const processMetrics = (snapshots: ReadonlyArray<Metric.Metric.Snapshot> = []) =>
      Effect.gen(function* () {
        yield* Effect.logInfo("[TelemetryWorker] Received high-signal metric pulse.");

        for (const { id, type, description, attributes, state } of snapshots)
          yield* Effect.log(`  -> Metric: "${id}"`, { type, description, attributes, state });
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
);
