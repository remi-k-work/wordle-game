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

const LoggerLayer = Logger.layer([Logger.consolePretty()]);

// HubTracerLayer is a custom Effect Tracer that pushes ended spans into TelemetryHub's PubSub
const TelemetryReadyLayer = Layer.mergeAll(HubTracerLayer, RpcTelemetryClient.layer).pipe(Layer.provideMerge(TelemetryHub.layer));
const AtomReadyLayer = Layer.mergeAll(Layer.succeed(AtomRegistry.AtomRegistry, sharedAtomRegistry), Reactivity.layer, BrowserKeyValueStore.layerLocalStorage);

// Basis for every client-side runtime: console logging + all RPC clients + atoms + tracer/hub.
const MainLayer = Layer.mergeAll(
  LoggerLayer,
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  RpcOverdriveHacksClient.layer,
  TelemetryReadyLayer,
  AtomReadyLayer
);

// RuntimeTelemetryStarter additionally runs the telemetry worker so the app can start collecting
// metrics (it is the runtime used to bootstrap/seed telemetry state).
const TelemetryStarterLayer = Layer.mergeAll(LoggerLayer, TelemetryWorkerLayer, AtomReadyLayer).pipe(Layer.provideMerge(TelemetryReadyLayer));

// RuntimeTelemetryStarter = runs the telemetry worker; RuntimeAtom = the standard app runtime.
export const RuntimeTelemetryStarter = runtimeFactory(TelemetryStarterLayer);
export const RuntimeAtom = runtimeFactory(MainLayer);
export const RuntimeClient = ManagedRuntime.make(MainLayer, { memoMap: sharedMemoMap });

// The services a client command may require: exactly what RuntimeClient provides.
// This keeps the requirements channel precise (service identifiers only) instead of
// widening it through `Parameters<typeof runPromise>[0]`, whose unresolved
// generics collapse the error channel to `unknown`.
type ClientCommandServices = Layer.Success<typeof MainLayer>;

// Runs an Effect from a fire-and-forget XState command action. Failures are logged but never
// reject, so unhandled Promise rejections cannot escape the synchronous XState action contract.
export const runClientCommand = <A, E>(effect: Effect.Effect<A, E, ClientCommandServices>): Promise<void> =>
  RuntimeClient.runPromise(
    effect.pipe(
      Effect.asVoid,
      Effect.catchCause((cause) => Effect.logError("[CLIENT COMMAND FAILED]:", cause))
    )
  );
