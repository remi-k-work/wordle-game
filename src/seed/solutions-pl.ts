// services, features, and other libraries
import { Array, Effect, Layer, Logger, FileSystem } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Reading the raw dictionary...");

  // Read the entire dictionary into memory
  const rawText = yield* fs.readFileString("./src/seed/dictionary-pl.txt", "utf8");

  yield* Effect.log("Processing and filtering words...");

  // Parse, filter, and uppercase the words
  const validWords = rawText
    .split("\n")
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length === 5);

  // Deduplicate (just in case the raw file has duplicates)
  const uniqueWords = Array.dedupe(validWords);

  yield* Effect.log(`Found ${uniqueWords.length} valid 5-letter words. Saving...`);

  // Write to the new JSON file
  yield* fs.writeFileString("./src/seed/solutions-pl.json", JSON.stringify(uniqueWords, null, 2));

  yield* Effect.log("Solutions successfully generated!");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
