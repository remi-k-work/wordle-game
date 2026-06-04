// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";

// constants
const SOLUTIONS_PATH = "./src/seed/solutions-pl.json";
const DEFINITIONS_PATH = "./src/seed/definitions-pl.json";

const MainLayer = Layer.mergeAll(Logger.pretty, NodeContext.layer);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("🔄 Starting structural synchronization between solutions and definitions...");

  // Read both JSON files asynchronously via Effect Platform
  const solutionsRaw = yield* fs.readFileString(SOLUTIONS_PATH, "utf8");
  const definitionsRaw = yield* fs.readFileString(DEFINITIONS_PATH, "utf8");

  // Parse strings to operational data structures
  const solutions: string[] = JSON.parse(solutionsRaw);
  const definitions: Record<string, string> = JSON.parse(definitionsRaw);

  // Convert solutions into an uppercase Set for O(1) lookups
  const solutionsSet = new Set(solutions.map((w) => w.toUpperCase()));
  const cleanDefinitions: Record<string, string> = {};
  let removalCount = 0;

  // Perform the intersection cleanup
  for (const [word, definition] of Object.entries(definitions)) {
    const upperWord = word.toUpperCase();
    if (solutionsSet.has(upperWord)) {
      cleanDefinitions[upperWord] = definition;
    } else {
      removalCount++;
    }
  }

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
