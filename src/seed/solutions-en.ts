// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";
import { makeWordlistSync } from "./wordlist";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(
  makeWordlistSync({
    inputs: ["./src/seed/wordle-La.txt", "./src/seed/wordle-Ta.txt"],
    output: "./src/seed/solutions-en.json",
    doneMessage: "Solutions successfully generated!",
  }).pipe(Effect.provide(MainLayer))
);
