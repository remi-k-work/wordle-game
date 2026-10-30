// services, features, and other libraries
import { Array, Effect, FileSystem, Schema } from "effect";

class WordlistJsonEncodeError extends Schema.TaggedError<WordlistJsonEncodeError, { readonly brand: unique symbol }>()("WordlistJsonEncodeError", {
  file: Schema.String,
  cause: Schema.Defect(),
}) {}

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
// — single source of truth per https://www.effect.solutions/data-modeling#json-encoding-decoding
const WordlistFromJson = Schema.fromJsonString(Schema.Array(Schema.String), { space: 2 });

// Schema.encodeEffect builds a parser on every call, so build it once at module scope
const encodeWordlist = Schema.encodeEffect(WordlistFromJson);

interface WordlistSyncOptions {
  // The raw word-list .txt files to merge (one per line)
  readonly inputs: ReadonlyArray<string>;
  // The target .json file
  readonly output: string;
  readonly doneMessage: string;
}

// Shared program behind the four wordlist seed scripts (solutions/dictionary × En/Pl):
// read the raw word lists, keep the 5-letter words uppercased and deduped, and
// persist them as pretty-printed JSON
export const makeWordlistSync = Effect.fn("makeWordlistSync")(function* ({ inputs, output, doneMessage }: WordlistSyncOptions) {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Reading the raw dictionary...");

  // Read the entire dictionaries into memory
  const rawTexts = yield* Effect.forEach(inputs, (input) => fs.readFileString(input, "utf8"));

  yield* Effect.log("Processing and filtering words...");

  // Parse, filter, and uppercase the words
  const validWords = rawTexts.flatMap((rawText) =>
    rawText
      .split("\n")
      .map((word) => word.trim().toUpperCase())
      .filter((word) => word.length === 5)
  );

  // Deduplicate (just in case the raw file has duplicates)
  const uniqueWords = Array.dedupe(validWords);

  yield* Effect.log(`Found ${uniqueWords.length} valid 5-letter words. Saving...`);

  // Encode to JSON string via the same fromJsonString schema (pretty-printed via { space: 2 })
  const wordlistJson = yield* encodeWordlist(uniqueWords).pipe(Effect.mapError((cause) => new WordlistJsonEncodeError({ file: output, cause })));

  // Write to the new JSON file
  yield* fs.writeFileString(output, wordlistJson);

  yield* Effect.log(doneMessage);
});
