// services, features, and other libraries
import { Layer, Logger, ManagedRuntime } from "effect";
import { Atom, AtomRegistry, Reactivity } from "effect/reactivity";
import { BrowserCrypto, BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";
import { HubTracerLayer } from "@/features/telemetry/services/hub-tracer";
import { TelemetryWorkerLayer } from "@/features/telemetry/services/telemetry-worker";
import { sharedAtomRegistry } from "@/ui/atom-registry-provider";

// One memo map shared by every runtime below (and by the atom runtime factory)
const sharedMemoMap = Layer.makeMemoMapUnsafe();
const runtimeFactory = Atom.context({ memoMap: sharedMemoMap });

const LoggerLayer = Logger.layer([Logger.consolePretty()]);

// HubTracerLayer is a custom Effect Tracer that pushes ended spans into TelemetryHub's PubSub
const TelemetryReadyLayer = Layer.mergeAll(HubTracerLayer, RpcTelemetryClient.layer, BrowserCrypto.layer).pipe(Layer.provideMerge(TelemetryHub.layer));
const AtomReadyLayer = Layer.mergeAll(Layer.succeed(AtomRegistry.AtomRegistry, sharedAtomRegistry), Reactivity.layer, BrowserKeyValueStore.layerLocalStorage);

// Basis for every client-side runtime: console logging + all RPC clients + atoms + tracer/hub
const MainLayer = Layer.mergeAll(
  LoggerLayer,
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  RpcOverdriveHacksClient.layer,
  TelemetryReadyLayer,
  AtomReadyLayer
);

// RuntimeTelemetryStarter additionally runs the telemetry worker so the app can start collecting
// metrics (it is the runtime used to bootstrap/seed telemetry state)
const TelemetryStarterLayer = Layer.mergeAll(LoggerLayer, TelemetryWorkerLayer, AtomReadyLayer).pipe(Layer.provideMerge(TelemetryReadyLayer));

// RuntimeTelemetryStarter = runs the telemetry worker; RuntimeAtom = the standard app runtime
export const RuntimeTelemetryStarter = runtimeFactory(TelemetryStarterLayer);

export const RuntimeAtom = runtimeFactory(MainLayer);
export const RuntimeClient = ManagedRuntime.make(MainLayer, { memoMap: sharedMemoMap });
