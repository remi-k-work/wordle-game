// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { WebSdk } from "@effect/opentelemetry";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";
import { HubMetricExporter, HubSpanExporter } from "@/features/telemetry/services/otel-exporters";

const TelemetryLayer = Layer.unwrap(
  Effect.gen(function* () {
    const { spanPubSub, metricPubSub, runWorkers } = yield* TelemetryHub;

    yield* Effect.forkDetach(runWorkers);

    return WebSdk.layer(() => ({
      resource: { serviceName: "wordle-overdrive-telemetry" },
      spanProcessor: new SimpleSpanProcessor(new HubSpanExporter(spanPubSub)),
      metricReader: new PeriodicExportingMetricReader({ exporter: new HubMetricExporter(metricPubSub), exportIntervalMillis: 10000 }),
    }));
  })
).pipe(Layer.provide(TelemetryHub.layer));

const MainLayer = Layer.mergeAll(
  Logger.layer([Logger.consolePretty()]),
  BrowserKeyValueStore.layerLocalStorage,
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  TelemetryLayer
);

export const RuntimeAtom = Atom.runtime(MainLayer);
