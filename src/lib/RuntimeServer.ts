// services, features, and other libraries
import { Config, Layer, Logger, ManagedRuntime } from "effect";
import { GoogleClient } from "@effect/ai-google";
import { NodeHttpClient } from "@effect/platform-node";
import { PgLive } from "./PgLive";

const MainLayer = Layer.mergeAll(
  Logger.pretty,
  Layer.provide(GoogleClient.layerConfig({ apiKey: Config.redacted("GOOGLE_GENERATIVE_AI_API_KEY") }), NodeHttpClient.layerUndici),
  PgLive
);

export const RuntimeServer = ManagedRuntime.make(MainLayer);
