/*
import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger, Schedule, Array, ExecutionPlan, Config, Schema } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeContext, NodeHttpClient, NodeRuntime } from "@effect/platform-node";
import { LanguageModel } from "@effect/ai";
import { GoogleClient, GoogleLanguageModel } from "@effect/ai-google";

// constants
const SOLUTIONS_PATH = "./src/seed/solutions-pl.json";
const DEFINITIONS_PATH = "./src/seed/definitions-pl.json";

const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = "10 seconds";

// Identical to our Riddle implementation, gracefully degrading if rate-limited OR on parsing failure
const DictionaryPlan = ExecutionPlan.make(
  { provide: GoogleLanguageModel.model("gemini-flash-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-flash-lite-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash-lite"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

// HYBRID PROMPT (LLM handles Lemma validation + definitions)
const DICTIONARY_PROMPT = (words: string[]) => `
Jesteś profesjonalnym słownikiem języka polskiego dla gry Wordle. Poddaj selekcji podane słowa.

Zasady selekcji (Wpisz słowo "null" jako definicję, jeśli):
1. Słowo jest odmienioną formą gramatyczną innego wyrazu.
   - Odrzucaj liczby mnogie (np. "PTAKI", "ABAKI", "ABAJE").
   - Odrzucaj przypadki zależne (np. "PTAKIEM", "ABAJĄ", "ABAKĘ").
   - Odrzucaj odmienione czasowniki (np. "ZJADŁ", "BIEGŁ").
2. Słowo to wulgaryzm, błąd ortograficzny, skrót lub nazwa własna.

Zasady dla poprawnych definicji:
1. Akceptuj wyłącznie podstawowe formy wyrazów (mianownik liczby pojedynczej dla rzeczowników, bezokolicznik dla czasowników).
2. Przygotuj edukacyjną, bogatą i wielozdaniową definicję.
3. Pisz wyłącznie czystym tekstem. Kategoryczny zakaz używania Markdownu (żadnych gwiazdek, znaków #, pogrubień czy kursywy).

Słowa do przetworzenia:
${JSON.stringify(words)}
`;

// We ask for an array of specific results to completely eliminate key confusion
const DictionarySchema = Schema.Struct({ results: Schema.Array(Schema.Struct({ word: Schema.String, definition: Schema.NullOr(Schema.String) })) });

const MainLayer = Layer.mergeAll(
  Logger.pretty,
  NodeContext.layer,
  Layer.provide(GoogleClient.layerConfig({ apiKey: Config.redacted("GOOGLE_GENERATIVE_AI_API_KEY") }), NodeHttpClient.layerUndici)
);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("📚 Initializing Polish Dictionary Generation & Moderation Pipeline...");

  // Load the words that need definitions
  const solutionsRaw = yield* fs.readFileString(SOLUTIONS_PATH, "utf8");

  // 🌟 FIX: Force uppercase immediately to prevent key mismatches and infinite reprocessing
  const words: string[] = JSON.parse(solutionsRaw).map((w: string) => w.toUpperCase());

  // Load existing definitions (to resume safely if script was interrupted)
  const existingDefsRaw = yield* fs.readFileString(DEFINITIONS_PATH, "utf8").pipe(
    Effect.catchAll(() => Effect.succeed("{}")) // Fallback if file doesn't exist yet
  );
  const definitions: Record<string, string> = JSON.parse(existingDefsRaw);

  // Filter out words we have already processed
  const pendingWords = words.filter((w) => !definitions[w]);

  if (pendingWords.length === 0) {
    return yield* Effect.log("✅ All Polish words have definitions! Nothing left to do.");
  }

  yield* Effect.log(`Found ${pendingWords.length} words left to process.`);

  // Chunk into batches
  const batches = Array.chunksOf(pendingWords, BATCH_SIZE);

  // Keep track of our master words array using a mutable copy for in-memory splicing
  let activeSolutions = [...words];

  // Process batches iteratively
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const preview = batch.slice(0, 3).join(", ") + (batch.length > 3 ? "..." : "");

    yield* Effect.log(`⏳ Processing batch ${i + 1}/${batches.length} [${preview}]`);

    // Use generateObject to get structured output directly
    const newResponse = yield* LanguageModel.generateObject({
      prompt: DICTIONARY_PROMPT(batch),
      schema: DictionarySchema,
    }).pipe(
      Effect.withExecutionPlan(DictionaryPlan),
      // If a batch fully fails all fallback models or breaks repeatedly, pause 30s and re-attempt
      Effect.retry(Schedule.spaced("30 seconds").pipe(Schedule.upTo("2 minutes")))
    );

    // The AI now returns an array of objects: { word: string, definition: string | null }
    const aiData = newResponse.value.results;

    // Track if we actually pruned anything in this batch
    let wordsPruned = 0;

    // Iterate through the structured array
    for (const item of aiData) {
      // Normalize the word to uppercase just to be safe
      const word = item.word.toUpperCase();
      const value = item.definition;

      // 🌟 GUARDRAIL: If the AI altered the word or hallucinated a new one, ignore it!
      if (!batch.includes(word)) {
        yield* Effect.logWarning(`⚠️ AI tried to smuggle or alter a word: ${word}. Ignored.`);
        continue;
      }

      // 🌟 FIX: Catch both structural null and the literal string "null"
      if (value === null || value === "null" || value.trim().toLowerCase() === "null") {
        // AI explicitly evaluated this and said it's invalid
        activeSolutions = activeSolutions.filter((w) => w !== word);
        wordsPruned++;
      } else {
        // Save the valid string definition
        definitions[word] = value;
      }
    }

    // Now we must check if the AI missed any words from the original batch
    // (This prevents the undefined skip bug from breaking the script)
    const returnedWords = aiData.map((item) => item.word.toUpperCase());
    for (const originalWord of batch) {
      if (!returnedWords.includes(originalWord)) {
        yield* Effect.logWarning(`⚠️ AI completely missed word: ${originalWord}. Keeping it pending.`);
      }
    }

    // Progressively save BOTH files simultaneously
    yield* fs.writeFileString(DEFINITIONS_PATH, JSON.stringify(definitions, null, 2));
    yield* fs.writeFileString(SOLUTIONS_PATH, JSON.stringify(activeSolutions, null, 2));

    if (wordsPruned > 0) {
      yield* Effect.log(`💾 Batch ${i + 1} saved. Pruned ${wordsPruned} obscure words from solutions list.`);
    } else {
      yield* Effect.log(`💾 Batch ${i + 1} saved successfully.`);
    }

    // Sleep to respect Free Tier Limits
    if (i < batches.length - 1) {
      yield* Effect.sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  yield* Effect.log("🎉 Polish Dictionary Generation & Clean up Complete!");
}).pipe(Effect.provide(MainLayer));

NodeRuntime.runMain(main);
*/
