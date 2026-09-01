// services, features, and other libraries
import { Array, Effect, HashMap, HashSet, pipe, FileSystem } from "effect";

export const makeSync = (solutionsPath: string, definitionsPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* Effect.log("🔄 Starting structural synchronization between solutions and definitions...");

    // Read both JSON files asynchronously via Effect Platform
    const solutionsRaw = yield* fs.readFileString(solutionsPath, "utf8");
    const definitionsRaw = yield* fs.readFileString(definitionsPath, "utf8");

    // Parse strings to operational data structures via Effect error channel (no unchecked throw)
    const solutions = yield* Effect.try({
      try: () => JSON.parse(solutionsRaw) as string[],
      catch: (cause) => new Error(`Failed to parse ${solutionsPath}`, { cause }),
    }).pipe(Effect.orDie);
    const definitions = yield* Effect.try({
      try: () => JSON.parse(definitionsRaw) as Record<string, string>,
      catch: (cause) => new Error(`Failed to parse ${definitionsPath}`, { cause }),
    }).pipe(Effect.orDie);

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
    yield* fs.writeFileString(definitionsPath, JSON.stringify(cleanDefinitions, null, 2));

    yield* Effect.log(`✨ Sync complete! Solutions: ${solutions.length} | Synchronized Definitions: ${Object.keys(cleanDefinitions).length}`);
  });
