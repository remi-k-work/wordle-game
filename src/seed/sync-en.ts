// services, features, and other libraries
import { Array, Effect, HashMap, HashSet, Layer, Logger, pipe, FileSystem } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";

// constants
const SOLUTIONS_PATH = "./src/seed/solutions-en.json";
const DEFINITIONS_PATH = "./src/seed/definitions-en.json";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("🔄 Starting structural synchronization between solutions and definitions...");

  // Read both JSON files asynchronously via Effect Platform
  const solutionsRaw = yield* fs.readFileString(SOLUTIONS_PATH, "utf8");
  const definitionsRaw = yield* fs.readFileString(DEFINITIONS_PATH, "utf8");

  // Parse strings to operational data structures
  const solutions: string[] = JSON.parse(solutionsRaw);
  const definitions: Record<string, string> = JSON.parse(definitionsRaw);

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
  const cleanDefinitions = Object.fromEntries(HashMap.toEntries(cleanMap)) as Record<string, string>;

  // Early return if nothing needs pruning
  if (removalCount === 0) {
    return yield* Effect.log("✅ Dataset is already pristine! Definitions match your solutions perfectly.");
  }

  yield* Effect.log(`🧹 Found ${removalCount} phantom words inside definitions. Pruning...`);

  // Persist the clean dictionary back to file
  yield* fs.writeFileString(DEFINITIONS_PATH, JSON.stringify(cleanDefinitions, null, 2));

  yield* Effect.log(`✨ Sync complete! Solutions: ${solutions.length} | Synchronized Definitions: ${Object.keys(cleanDefinitions).length}`);
}).pipe(Effect.provide(MainLayer));

// Graceful execution and teardown via NodeRuntime
NodeRuntime.runMain(main);
