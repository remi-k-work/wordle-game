// services, features, and other libraries
import { Array, Effect, FileSystem, HashMap, HashSet, pipe, Schema } from "effect";

class SeedJsonParseError extends Schema.TaggedError<SeedJsonParseError>()("SeedJsonParseError", {
  file: Schema.String,
  cause: Schema.Defect(),
}) {}

const SolutionsSchema = Schema.Array(Schema.String);
const DefinitionsSchema = Schema.Record(Schema.String, Schema.String);

// fromJsonString combines JSON.parse + schema decoding (and JSON.stringify + encoding on the way back)
// — single source of truth per https://www.effect.solutions/data-modeling#json-encoding-decoding
const SolutionsFromJson = Schema.fromJsonString(SolutionsSchema);
const DefinitionsFromJson = Schema.fromJsonString(DefinitionsSchema, { space: 2 });

export const makeSync = (solutionsPath: string, definitionsPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* Effect.log("🔄 Starting structural synchronization between solutions and definitions...");

    // Read both JSON files asynchronously via Effect Platform
    const solutionsRaw = yield* fs.readFileString(solutionsPath, "utf8");
    const definitionsRaw = yield* fs.readFileString(definitionsPath, "utf8");

    // Parse + validate in one step via fromJsonString (no `as` cast, no global Error in failure channel)
    const solutions = yield* Schema.decodeEffect(SolutionsFromJson)(solutionsRaw).pipe(
      Effect.mapError((cause) => new SeedJsonParseError({ file: solutionsPath, cause })),
      Effect.orDie
    );
    const definitions = yield* Schema.decodeEffect(DefinitionsFromJson)(definitionsRaw).pipe(
      Effect.mapError((cause) => new SeedJsonParseError({ file: definitionsPath, cause })),
      Effect.orDie
    );

    // Convert solutions into an uppercase HashSet for O(1) lookups
    const solutionsSet = HashSet.fromIterable(solutions.map((w) => w.toUpperCase()));

    // Perform the intersection cleanup functionally — HashMap for absent-key safety, no mutation
    const { clean: cleanMap, removed: removalCount } = pipe(
      Object.entries(definitions),
      Array.reduce({ clean: HashMap.empty<string, string>(), removed: 0 }, (acc, [word, definition]) => {
        const upperWord = word.toUpperCase();
        return HashSet.has(solutionsSet, upperWord)
          ? { clean: HashMap.set(acc.clean, upperWord, definition), removed: acc.removed }
          : { clean: acc.clean, removed: acc.removed + 1 };
      })
    );
    const cleanDefinitions = Object.fromEntries(HashMap.toEntries(cleanMap));

    // Early return if nothing needs pruning
    if (removalCount === 0) {
      return yield* Effect.log("✅ Dataset is already pristine! Definitions match your solutions perfectly.");
    }

    yield* Effect.log(`🧹 Found ${removalCount} phantom words inside definitions. Pruning...`);

    // Encode to JSON string via the same fromJsonString schema (pretty-printed via { space: 2 })
    const cleanJson = yield* Schema.encodeEffect(DefinitionsFromJson)(cleanDefinitions).pipe(
      Effect.mapError((cause) => new SeedJsonParseError({ file: definitionsPath, cause })),
      Effect.orDie
    );
    yield* fs.writeFileString(definitionsPath, cleanJson);

    yield* Effect.log(`✨ Sync complete! Solutions: ${solutions.length} | Synchronized Definitions: ${Object.keys(cleanDefinitions).length}`);
  });
