// services, features, and other libraries
import { Effect, FileSystem, HashSet, Record, Schema } from "effect";

class SeedJsonParseError extends Schema.TaggedError<SeedJsonParseError, { readonly brand: unique symbol }>()("SeedJsonParseError", {
  file: Schema.String,
  cause: Schema.Defect(),
}) {}

const SolutionsSchema = Schema.Array(Schema.String);
const DefinitionsSchema = Schema.Record(Schema.String, Schema.String);

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
// — single source of truth per https://www.effect.solutions/data-modeling#json-encoding-decoding
const SolutionsFromJson = Schema.fromJsonString(SolutionsSchema);
const DefinitionsFromJson = Schema.fromJsonString(DefinitionsSchema, { space: 2 });

// Schema.decodeEffect / Schema.encodeEffect build a parser on every call,
// so build them once at module scope instead of per run
const decodeSolutions = Schema.decodeEffect(SolutionsFromJson);
const decodeDefinitions = Schema.decodeEffect(DefinitionsFromJson);
const encodeDefinitions = Schema.encodeEffect(DefinitionsFromJson);

export const makeSync = Effect.fn("makeSync")(function* (solutionsPath: string, definitionsPath: string) {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("🔄 Starting structural synchronization between solutions and definitions...");

  // Read both JSON files asynchronously via Effect Platform
  const solutionsRaw = yield* fs.readFileString(solutionsPath, "utf8");
  const definitionsRaw = yield* fs.readFileString(definitionsPath, "utf8");

  // Parse + validate in one step via fromJsonString (no `as` cast, no global Error in failure channel)
  const solutions = yield* decodeSolutions(solutionsRaw).pipe(Effect.mapError((cause) => new SeedJsonParseError({ file: solutionsPath, cause })));
  const definitions = yield* decodeDefinitions(definitionsRaw).pipe(Effect.mapError((cause) => new SeedJsonParseError({ file: definitionsPath, cause })));

  // Convert solutions into an uppercase HashSet for O(1) lookups
  const solutionsSet = HashSet.fromIterable(solutions.map((w) => w.toUpperCase()));

  // Keep only definitions for known solutions and normalize their keys
  const cleanDefinitions = Record.mapKeys(
    Record.filter(definitions, (_, word) => HashSet.has(solutionsSet, word.toUpperCase())),
    (word) => word.toUpperCase()
  );
  const removalCount = Record.size(definitions) - Record.size(cleanDefinitions);

  // Early return if nothing needs pruning
  if (removalCount === 0) {
    return yield* Effect.log("✅ Dataset is already pristine! Definitions match your solutions perfectly.");
  }

  yield* Effect.log(`🧹 Found ${removalCount} phantom words inside definitions. Pruning...`);

  // Encode to JSON string via the same fromJsonString schema (pretty-printed via { space: 2 })
  const cleanJson = yield* encodeDefinitions(cleanDefinitions).pipe(Effect.mapError((cause) => new SeedJsonParseError({ file: definitionsPath, cause })));
  yield* fs.writeFileString(definitionsPath, cleanJson);

  yield* Effect.log(`✨ Sync complete! Solutions: ${solutions.length} | Synchronized Definitions: ${Record.size(cleanDefinitions)}`);
});
