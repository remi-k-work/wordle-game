// services, features, and other libraries
import { Effect, Layer, Logger, ManagedRuntime } from "effect";
import { Atom, AtomRegistry, Reactivity } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";
import { HubTracerLayer } from "@/features/telemetry/services/hub-tracer";
import { TelemetryWorkerLayer } from "@/features/telemetry/services/telemetry-worker";
import { sharedAtomRegistry } from "@/lib/atom-registry-provider";

const sharedMemoMap = Layer.makeMemoMapUnsafe();
const runtimeFactory = Atom.context({ memoMap: sharedMemoMap });

// HubTracerLayer is a custom Effect Tracer that pushes ended spans into TelemetryHub's PubSub
const TelemetryReadyLayer = Layer.mergeAll(HubTracerLayer, RpcTelemetryClient.layer).pipe(Layer.provideMerge(TelemetryHub.layer));
const AtomReadyLayer = Layer.mergeAll(Layer.succeed(AtomRegistry.AtomRegistry, sharedAtomRegistry), Reactivity.layer, BrowserKeyValueStore.layerLocalStorage);

const TelemetryStarterLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), TelemetryWorkerLayer, AtomReadyLayer).pipe(
  Layer.provideMerge(TelemetryReadyLayer)
);
const MainLayer = Layer.mergeAll(
  Logger.layer([Logger.consolePretty()]),
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  RpcOverdriveHacksClient.layer,
  TelemetryReadyLayer,
  AtomReadyLayer
);

export const RuntimeTelemetryStarter = runtimeFactory(TelemetryStarterLayer);
export const RuntimeAtom = runtimeFactory(MainLayer);
export const RuntimeClient = ManagedRuntime.make(MainLayer, { memoMap: sharedMemoMap });

// Runs an Effect from a fire-and-forget XState command action. Failures are logged but never
// reject, so unhandled Promise rejections cannot escape the synchronous XState action contract.
export const runClientCommand = (effect: Parameters<typeof RuntimeClient.runPromise>[0]): Promise<void> =>
  RuntimeClient.runPromise(
    effect.pipe(
      Effect.asVoid,
      Effect.catchCause((cause) => Effect.logError(`[CLIENT COMMAND FAILED]: ${cause}`))
    )
  );
