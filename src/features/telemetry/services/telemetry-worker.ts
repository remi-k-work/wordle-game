/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Effect, Layer, Stream, Duration, Option, Equal } from "effect";
import { TelemetryHub } from "./telemetry-hub";
import { DataPointType } from "@opentelemetry/sdk-metrics";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ResourceMetrics, MetricData, ScopeMetrics } from "@opentelemetry/sdk-metrics";

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

    // This function filters out any data point that has not changed since the last snapshot
    const diffMetrics = (currResourceMetrics: ResourceMetrics, prevResourceMetricsOption: Option.Option<ResourceMetrics>) => {
      const prevResourceMetrics = Option.getOrUndefined(prevResourceMetricsOption);

      // Map to track previous values for ALL metrics: "metricName|attributes" -> value
      const prevResourceMetricsMap = new Map<string, unknown>();
      if (prevResourceMetrics) {
        for (const { metrics } of prevResourceMetrics.scopeMetrics)
          for (const {
            descriptor: { name },
            dataPoints,
          } of metrics)
            for (const { attributes, value } of dataPoints) prevResourceMetricsMap.set(`${name}|${JSON.stringify(attributes)}`, value);
      }

      const filteredScopeMetrics: ScopeMetrics[] = [];
      for (const currScopeMetrics of currResourceMetrics.scopeMetrics) {
        const filteredMetrics: MetricData[] = [];

        for (const metric of currScopeMetrics.metrics) {
          const filteredDataPoints = metric.dataPoints.filter(({ attributes, value }) => {
            // Rule 1: Content must actually be different (structural equality via v4 Equal.equals)
            if (Equal.equals(value, prevResourceMetricsMap.get(`${metric.descriptor.name}|${JSON.stringify(attributes)}`))) return false;

            // Rule 2: Optimization for SUM in DELTA mode - drop explicit zero increments
            if (metric.dataPointType === DataPointType.SUM && value === 0) return false;

            return true;
          });

          if (filteredDataPoints.length > 0) filteredMetrics.push({ ...metric, dataPoints: filteredDataPoints as any });
        }
        if (filteredMetrics.length > 0) filteredScopeMetrics.push({ ...currScopeMetrics, metrics: filteredMetrics });
      }
      if (filteredScopeMetrics.length === 0) return undefined;

      return { ...currResourceMetrics, scopeMetrics: filteredScopeMetrics };
    };

    const processMetrics = ({ scopeMetrics }: ResourceMetrics) =>
      Effect.gen(function* () {
        yield* Effect.logInfo("[TelemetryWorker] Received high-signal metric pulse.");

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
    const metricProcessor = Stream.fromPubSub(metricPubSub).pipe(
      Stream.zipWithPrevious,
      Stream.map(([prevResourceMetrics, currResourceMetrics]) => diffMetrics(currResourceMetrics, prevResourceMetrics)),
      Stream.filter((diffResourceMetrics): diffResourceMetrics is ResourceMetrics => diffResourceMetrics !== undefined),
      Stream.runForEach(processMetrics)
    );

    // Run both processors in the background (Detach from parent scope)
    yield* Effect.forkDetach(spanProcessor);
    yield* Effect.forkDetach(metricProcessor);

    yield* Effect.logInfo("[TelemetryWorker] Background telemetry processors started.");
  })
);
