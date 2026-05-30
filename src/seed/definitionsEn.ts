import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger, Schedule, Array as EffectArray, ExecutionPlan, Config } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeContext, NodeHttpClient, NodeRuntime } from "@effect/platform-node";
import { LanguageModel } from "@effect/ai";
import { GoogleClient, GoogleLanguageModel } from "@effect/ai-google";

// constants
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = "5 seconds";

// Identical to our Riddle implementation, gracefully degrading if rate-limited
const DictionaryPlan = ExecutionPlan.make(
  { provide: GoogleLanguageModel.model("gemini-flash-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-flash-lite-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash-lite"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

// Strictly commanding the model to output raw JSON mapping words to one-sentence definitions
const DICTIONARY_PROMPT_EN = (
  words: string[]
) => `You are a highly precise dictionary assistant. For each of the following 5-letter English words, provide a clear, concise, one-sentence definition suitable for a general audience.
Return your answer STRICTLY as a raw JSON object where the keys are the uppercase words and the values are their definitions. Do not include any conversational text. Do not wrap the output in markdown blocks (e.g., no \`\`\`json).

Words to define:
${JSON.stringify(words)}
`;

// Utility to sanitize LLM JSON output
const parseAIJson = (rawText: string): Record<string, string> => {
  try {
    // Strip out markdown code blocks if present
    let sanitized = rawText
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    // Strip trailing commas before closing curly braces or square brackets
    // Matches a comma followed by optional whitespace and a closing } or ]
    sanitized = sanitized.replace(/,(\s*[}\]])/g, "$1");

    return JSON.parse(sanitized);
  } catch {
    throw new Error(`Failed to parse AI output as JSON: ${rawText}`);
  }
};

const MainLayer = Layer.mergeAll(
  Logger.pretty,
  NodeContext.layer,
  Layer.provide(GoogleClient.layerConfig({ apiKey: Config.redacted("GOOGLE_GENERATIVE_AI_API_KEY") }), NodeHttpClient.layerUndici)
);

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("📚 Initializing Dictionary Generation Pipeline...");

  // Load the words that need definitions
  const solutionsRaw = yield* fs.readFileString("./src/seed/solutionsEn.json", "utf8");
  const words: string[] = JSON.parse(solutionsRaw);

  // Load existing definitions (to resume safely if script was interrupted)
  const definitionsFile = "./src/seed/definitionsEn.json";
  const existingDefsRaw = yield* fs.readFileString(definitionsFile, "utf8").pipe(
    Effect.catchAll(() => Effect.succeed("{}")) // Fallback if file doesn't exist yet
  );
  const definitions: Record<string, string> = JSON.parse(existingDefsRaw);

  // Filter out words we have already processed
  const pendingWords = words.filter((w) => !definitions[w]);

  if (pendingWords.length === 0) {
    return yield* Effect.log("✅ All words have definitions! Nothing left to do.");
  }

  yield* Effect.log(`Found ${pendingWords.length} words left to define.`);

  // Chunk into batches
  const batches = EffectArray.chunksOf(pendingWords, BATCH_SIZE);

  // Process batches iteratively
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const preview = batch.slice(0, 3).join(", ") + (batch.length > 3 ? "..." : "");

    yield* Effect.log(`⏳ Processing batch ${i + 1}/${batches.length} [${preview}]`);

    // Call the LLM using your ExecutionPlan
    const aiResponseText = yield* LanguageModel.generateText({
      prompt: DICTIONARY_PROMPT_EN(batch),
    }).pipe(
      Effect.withExecutionPlan(DictionaryPlan),
      Effect.map(({ text }) => text),
      // If the entire execution plan fails (e.g. strict rate limit), wait 30s and try the batch again
      Effect.retry(Schedule.spaced("30 seconds").pipe(Schedule.upTo("2 minutes")))
    );

    // Parse the AI's JSON output
    const newDefinitions = parseAIJson(aiResponseText);

    // Merge and save incrementally
    Object.assign(definitions, newDefinitions);
    yield* fs.writeFileString(definitionsFile, JSON.stringify(definitions, null, 2));

    yield* Effect.log(`💾 Batch ${i + 1} saved successfully.`);

    // Sleep to respect the Free Tier Limits
    if (i < batches.length - 1) {
      yield* Effect.sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  yield* Effect.log("🎉 Dictionary Generation Complete!");
}).pipe(Effect.provide(MainLayer));

NodeRuntime.runMain(main);
