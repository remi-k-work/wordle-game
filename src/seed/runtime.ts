// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";

// Shared runtime for every seed script: pretty console logs + Node platform services
export const SeedLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

// Runs a seed program with graceful teardown on CTRL+C. Typed failures are
// reported by NodeRuntime instead of being erased with Effect.orDie
export const runSeed = <A, E>(effect: Effect.Effect<A, E, NodeServices.NodeServices>) => NodeRuntime.runMain(effect.pipe(Effect.provide(SeedLayer)));
