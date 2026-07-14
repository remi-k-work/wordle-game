// services, features, and other libraries
import { Layer, Logger, ManagedRuntime } from "effect";
import { Atom, AtomRegistry, Reactivity } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";
import { HubTracerLayer } from "@/features/telemetry/services/hub-tracer";
import { TelemetryWorkerLayer } from "@/features/telemetry/services/telemetry-worker";
import { sharedAtomRegistry } from "@/lib/atom-registry-provider";

// HubTracerLayer is a custom Effect Tracer that pushes ended spans into TelemetryHub's PubSub
const TelemetryReadyLayer = Layer.mergeAll(HubTracerLayer, RpcTelemetryClient.layer).pipe(Layer.provideMerge(TelemetryHub.layer));
const AtomReadyLayer = Layer.mergeAll(Layer.succeed(AtomRegistry.AtomRegistry, sharedAtomRegistry), Reactivity.layer, BrowserKeyValueStore.layerLocalStorage);

const TelemetryStarterLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), TelemetryWorkerLayer, AtomReadyLayer).pipe(
  Layer.provideMerge(TelemetryReadyLayer)
);
const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), RpcGameClient.layer, RpcHighScoreClient.layer, TelemetryReadyLayer, AtomReadyLayer);

export const RuntimeTelemetryStarter = Atom.runtime(TelemetryStarterLayer);
export const RuntimeAtom = Atom.runtime(MainLayer);
export const RuntimeClient = ManagedRuntime.make(MainLayer, { memoMap: Atom.runtime.memoMap });
