// services, features, and other libraries
import { Effect, Layer, Stream, Duration } from "effect";
import { TelemetryHub } from "./telemetry-hub";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ResourceMetrics } from "@opentelemetry/sdk-metrics";

// TelemetryWorkerLayer is a background service that consumes telemetry data from the Hub
export const TelemetryWorkerLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const { spanPubSub, metricPubSub } = yield* TelemetryHub;

    // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
    const processSpanBatch = (readableSpanBatch: readonly ReadableSpan[]) =>
      Effect.gen(function* () {
        if (readableSpanBatch.length === 0) return;

        yield* Effect.logInfo(`[TelemetryWorker] Processing batch of ${readableSpanBatch.length} spans.`);

        for (const { name, attributes } of readableSpanBatch) {
          yield* Effect.log(`  -> Span: "${name}"`, { attributes });
        }
      });

    // Metrics can be processed as they arrive from the PeriodicReader
    const processMetrics = ({ scopeMetrics }: ResourceMetrics) =>
      Effect.gen(function* () {
        yield* Effect.logInfo("[TelemetryWorker] Received global pulse snapshot.");

        for (const { metrics } of scopeMetrics) {
          for (const {
            descriptor: { name, description },
            dataPoints,
          } of metrics) {
            yield* Effect.log(`  -> Metric: "${name}"`, { description, dataPoints: dataPoints.map(({ value, attributes }) => ({ value, attributes })) });
          }
        }
      });

    // --- Stream 1: Spans ---
    const spanProcessor = Stream.fromPubSub(spanPubSub).pipe(
      Stream.flatMap((readableSpans: ReadableSpan[]) => Stream.fromIterable(readableSpans)),
      Stream.groupedWithin(50, Duration.seconds(5)),
      Stream.runForEach(processSpanBatch)
    );

    // --- Stream 2: Metrics ---
    const metricProcessor = Stream.fromPubSub(metricPubSub).pipe(Stream.runForEach(processMetrics));

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkDetach(spanProcessor);
    yield* Effect.forkDetach(metricProcessor);

    yield* Effect.logInfo("[TelemetryWorker] Background telemetry processors started.");
  })
);
