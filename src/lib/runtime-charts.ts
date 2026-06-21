// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom, AtomRegistry, Reactivity } from "effect/unstable/reactivity";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";

const ChartsLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), AtomRegistry.layer, Reactivity.layer, RpcTelemetryClient.layer);

export const RuntimeCharts = Atom.runtime(ChartsLayer);
