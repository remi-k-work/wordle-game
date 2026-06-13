// services, features, and other libraries
import { Context, Duration, Effect, Layer, PubSub, Stream } from "effect";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ResourceMetrics } from "@opentelemetry/sdk-metrics";

// TelemetryHub is the central rendezvous point for all telemetry data (bridge between the OpenTelemetry (push) and the Effect Stream Worker (pull))
export class TelemetryHub extends Context.Service<TelemetryHub>()("TelemetryHub", {
  make: Effect.gen(function* () {
    const spanPubSub = yield* PubSub.unbounded<ReadableSpan[]>();
    const metricPubSub = yield* PubSub.unbounded<ResourceMetrics>();

    // Ensure the PubSubs are properly shut down when the service is no longer needed.
    yield* Effect.addFinalizer(() => Effect.all([PubSub.shutdown(spanPubSub), PubSub.shutdown(metricPubSub)], { concurrency: 2 }));

    // Background worker for Stream 1 (Spans)
    const spanWorker = Stream.fromPubSub(spanPubSub).pipe(
      // Batching that involves collecting up to 50 spans or waiting a maximum of 5 seconds
      Stream.groupedWithin(50, Duration.seconds(5)),
      Stream.runForEach((readableSpanGroup) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`[Stream 1 - Spans Worker] Processing batch of ${readableSpanGroup.length} spans.`);

          for (const readableSpanChunk of readableSpanGroup) {
            for (const { name, attributes } of readableSpanChunk) {
              // For now, we drill and output the flat attributes we created earlier to the console
              yield* Effect.log(`  -> Span: "${name}"`, { attributes });
            }
          }
        })
      )
    );

    // Background worker for Stream 2 (Metrics)
    const metricWorker = Stream.fromPubSub(metricPubSub).pipe(
      // Metrics can be processed as they arrive from the PeriodicReader
      Stream.runForEach(({ scopeMetrics }) =>
        Effect.gen(function* () {
          yield* Effect.logInfo("[Stream 2 - Metrics Worker] Received global pulse snapshot.");

          for (const { metrics } of scopeMetrics) {
            for (const {
              descriptor: { name, description },
              dataPoints,
            } of metrics) {
              yield* Effect.log(`  -> Metric: "${name}"`, { description, dataPoints: dataPoints.map(({ value, attributes }) => ({ value, attributes })) });
            }
          }
        })
      )
    );

    // Combine both workers to run concurrently in the background forever
    const runWorkers = Effect.all([spanWorker, metricWorker], { concurrency: 2 }).pipe(Effect.asVoid);

    return { spanPubSub, metricPubSub, runWorkers } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
