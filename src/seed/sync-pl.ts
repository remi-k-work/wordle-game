// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";
import { makeSync } from "./sync";

// constants
const SOLUTIONS_PATH = "./src/seed/solutions-pl.json";
const DEFINITIONS_PATH = "./src/seed/definitions-pl.json";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

const main = makeSync(SOLUTIONS_PATH, DEFINITIONS_PATH).pipe(Effect.provide(MainLayer));

// Graceful execution and teardown via NodeRuntime
NodeRuntime.runMain(main);
