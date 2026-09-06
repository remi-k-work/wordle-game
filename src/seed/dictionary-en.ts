// services, features, and other libraries
import { Array, Effect, Layer, Logger, FileSystem, Schema } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";

class DictionaryJsonEncodeError extends Schema.TaggedError<DictionaryJsonEncodeError>()("DictionaryJsonEncodeError", {
  file: Schema.String,
  cause: Schema.Defect(),
}) {}

const DictionarySchema = Schema.Array(Schema.String);

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
// — single source of truth per https://www.effect.solutions/data-modeling#json-encoding-decoding
const DictionaryFromJson = Schema.fromJsonString(DictionarySchema, { space: 2 });

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Reading the raw dictionary...");

  // Read the entire dictionary into memory
  const rawText1 = yield* fs.readFileString("./src/seed/wordle-La.txt", "utf8");
  const rawText2 = yield* fs.readFileString("./src/seed/wordle-Ta.txt", "utf8");

  yield* Effect.log("Processing and filtering words...");

  // Parse, filter, and uppercase the words
  const validWords1 = rawText1
    .split("\n")
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length === 5);
  const validWords2 = rawText2
    .split("\n")
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length === 5);

  // Deduplicate (just in case the raw file has duplicates)
  const uniqueWords = Array.dedupe([...validWords1, ...validWords2]);

  yield* Effect.log(`Found ${uniqueWords.length} valid 5-letter words. Saving...`);

  // Encode to JSON string via the same fromJsonString schema (pretty-printed via { space: 2 })
  const dictionaryJson = yield* Schema.encodeEffect(DictionaryFromJson)(uniqueWords).pipe(
    Effect.mapError((cause) => new DictionaryJsonEncodeError({ file: "./src/seed/dictionary-en.json", cause })),
    Effect.orDie
  );

  // Write to the new JSON file
  yield* fs.writeFileString("./src/seed/dictionary-en.json", dictionaryJson);

  yield* Effect.log("English dictionary successfully generated!");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
