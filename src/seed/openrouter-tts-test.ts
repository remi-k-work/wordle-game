import "dotenv/config";

// services, features, and other libraries
import { Effect, FileSystem, Layer, Logger } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { OpenRouter } from "@/services/open-router";

// constants
const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, OpenRouter.layer);

const main = Effect.gen(function* () {
  yield* Effect.log("Testing the OpenRouter TTS API...\n");

  const { generateSpeech } = yield* OpenRouter;
  const fs = yield* FileSystem.FileSystem;

  const { audioData, generationId } = yield* generateSpeech({ input: "Hello! This is a text-to-speech test." });

  yield* fs.writeFile(`./src/seed/output-${generationId}.mp3`, audioData);
  yield* Effect.log(`Audio saved to 'output-${generationId}.mp3' successfully!`);
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
