// services, features, and other libraries
import { Layer, Logger, Effect, ManagedRuntime } from "effect";
import { Atom, AtomRegistry, Reactivity } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { WebSdk } from "@effect/opentelemetry";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";
import { TelemetryWorkerLayer } from "@/features/telemetry/services/telemetry-worker";
import { HubSpanExporter } from "@/features/telemetry/services/otel-exporters";

// The TelemetryLayer bridges the OTel SDK into our Effect-native TelemetryHub (Spans only)
const TelemetryLayer = WebSdk.layer(
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;

    return { resource: { serviceName: "wordle-overdrive-telemetry" }, spanProcessor: new SimpleSpanProcessor(new HubSpanExporter(spanPubSub)) } as const;
  })
);

const TelemetryReadyLayer = Layer.mergeAll(TelemetryLayer, RpcTelemetryClient.layer).pipe(Layer.provideMerge(TelemetryHub.layer));

const MainLayer = Layer.mergeAll(
  Logger.layer([Logger.consolePretty()]),
  AtomRegistry.layer,
  Reactivity.layer,
  BrowserKeyValueStore.layerLocalStorage,
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  TelemetryReadyLayer
);

const TelemetryStarterLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), AtomRegistry.layer, Reactivity.layer, TelemetryWorkerLayer).pipe(
  Layer.provideMerge(TelemetryReadyLayer)
);

export const RuntimeAtom = Atom.runtime(MainLayer);
export const RuntimeTelemetryStarter = Atom.runtime(TelemetryStarterLayer);
export const RuntimeClient = ManagedRuntime.make(MainLayer);
