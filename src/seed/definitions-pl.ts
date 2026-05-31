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

const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = "5 seconds";

// Identical to our Riddle implementation, gracefully degrading if rate-limited OR on parsing failure
const DictionaryPlan = ExecutionPlan.make(
  { provide: GoogleLanguageModel.model("gemini-flash-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-flash-lite-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash-lite"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

// Strictly commanding the model to output raw JSON mapping words to one-sentence definitions
const DICTIONARY_PROMPT = (
  words: string[]
) => `Jesteś precyzyjnym asystentem języka polskiego i moderatorem gry słownej typu Wordle. Dla każdego z poniższych 5-literowych słów przygotuj jasną, krótką, jednozdaniową definicję.
⚠️ ZASADA SPECJALNA: Jeśli słowo nie istnieje w języku polskim, jest skrajnie archaiczną formą gramatyczną, błędem zapisu, skrótem lub jest tak rzadkie, że przeciętny gracz go nie zrozumie – przypisz mu wartość null zamiast definicji. Nie wymyślaj definicji na siłę.
Zwróć odpowiedź WYŁĄCZNIE jako surowy obiekt JSON (bez bloków \`\`\`json), gdzie kluczem jest słowo pisane wielkimi literami, a wartością definicja (string) lub null.

Słowa do zdefiniowania:
${JSON.stringify(words)}
`;

// Utility to sanitize and parse LLM JSON output safely inside an Effect channel
export class ParseAIJsonError extends Schema.TaggedError<ParseAIJsonError>()("ParseAIJsonError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

const parseAIJsonEffect = (rawText: string) =>
  Effect.try({
    try: () => {
      let sanitized = rawText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      // Strip trailing commas before closing curly braces or square brackets
      sanitized = sanitized.replace(/,(\s*[}\]])/g, "$1");

      return JSON.parse(sanitized) as Record<string, string | null>;
    },
    catch: (cause) => new ParseAIJsonError({ message: `Failed to parse AI output as JSON: ${rawText}. Internal error: ${cause}`, cause }),
  });

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
  const words: string[] = JSON.parse(solutionsRaw);

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

    // We execute the text generation AND the JSON parsing together inside the ExecutionPlan!
    const newResponse = yield* LanguageModel.generateText({
      prompt: DICTIONARY_PROMPT(batch),
    }).pipe(
      Effect.flatMap(({ text }) => parseAIJsonEffect(text)),
      Effect.withExecutionPlan(DictionaryPlan),
      // If a batch fully fails all fallback models or breaks parsing repeatedly, pause 30s and re-attempt
      Effect.retry(Schedule.spaced("30 seconds").pipe(Schedule.upTo("2 minutes")))
    );

    // Track if we actually pruned anything in this batch
    let wordsPruned = 0;

    // Iterate through the batch to split definitions from deletions
    for (const word of batch) {
      const value = newResponse[word];

      if (value === null || value === undefined) {
        // Remove from solutions array
        activeSolutions = activeSolutions.filter((w) => w !== word);
        wordsPruned++;
      } else {
        // Save the valid definition
        definitions[word] = value;
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
