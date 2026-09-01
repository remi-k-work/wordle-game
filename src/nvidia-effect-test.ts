import "dotenv/config";

// services, features, and other libraries
import { Config, Effect, Layer, Logger, Redacted, Schedule, Schema } from "effect";
import { NodeServices, NodeRuntime, NodeHttpClient } from "@effect/platform-node";
import * as OpenAiLanguageModel from "@effect/ai-openai-compat/OpenAiLanguageModel";
import * as OpenAiClient from "@effect/ai-openai-compat/OpenAiClient";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as Prompt from "effect/unstable/ai/Prompt";

// =============================================================================
// Test Schemas (matching the application's actual schemas)
// =============================================================================

const RiddleSchema = Schema.Struct({
  riddle: Schema.String,
});

const ClueSchema = Schema.Struct({
  clue: Schema.String,
});

// =============================================================================
// Test Prompts (from the actual application)
// =============================================================================

const TEST_SYSTEM_PROMPT_RIDDLE = `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "MIRROR".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question (e.g., "What am I?").
2. Reference at least one concrete real-world domain, function, or associated object so a player can logically guess it.
3. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
4. Keep it plain text, suitable for Text-To-Speech (no Markdown, emojis, or formatting).
5. Do not include any preamble or meta-talk. Output ONLY the riddle.
6. SELF-VERIFY: Ensure the word "MIRROR" is completely absent.

EXAMPLE TONE AND FORMAT:
Context: Secret word is "MIRROR"
Riddle: I can show you the world, but I have no eyes. I reflect your every move but have no mind of my own. What am I?
`;

const TEST_SYSTEM_PROMPT_CLUE = `
You are an elite analytical AI assistant in a high-stakes word puzzle game. The player has spent valuable resources to summon you for a premium lifeline.
The secret word is "MIRROR". 

CRITICAL RULES:
1. Provide a highly insightful, contextual clue about the secret word's meaning, category, or usage.
2. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
3. Be highly descriptive and creative. Make it suitable for Text-To-Speech (plain text, no Markdown, no emojis).
4. Do not include any preamble, greetings, or meta-talk (e.g., "Here is a clue"). Output ONLY the clue.
5. SELF-VERIFY before outputting: Ensure the word "MIRROR" is completely absent from your response.

EXAMPLE OF EXPECTED OUTPUT TONE AND FORMAT:
Context: Secret word is "CLOCK". Player guessed "BRICK" (C yellow, K green).
Clue: You correctly identified the letter K at the end, and you know there is a C somewhere in the mix. While your guess is a building material, you need to shift your focus to everyday mechanisms. Think about devices usually mounted on a wall or worn on a wrist that help us measure the passage of time.
`;

const TEST_RIDDLE_PROMPT = "Craft the riddle now.";
const TEST_CLUE_PROMPT = `Craft the override clue now based on the following context:

The player has not made any guesses yet (Turn 1).
-> Provide a concrete, descriptive real-world category, origin, or general domain where this word is encountered to give them a strong starting point.`;

// =============================================================================
// Model Configuration
// =============================================================================

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

// Test models - NVIDIA first-party + OpenAI reasoning models available on the free dev key.
// Each entry carries provider-specific sampling config matching NVIDIA's own examples.
const TEST_MODELS = [
  {
    model: "nvidia/nemotron-3-super-120b-a12b",
    temperature: 1,
    top_p: 0.95,
    max_tokens: 1024,
    chat_template_kwargs: { enable_thinking: true },
    timeout: "180 seconds",
  },
  {
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    temperature: 1,
    top_p: 0.95,
    max_tokens: 1024,
    chat_template_kwargs: { enable_thinking: true },
    timeout: "180 seconds",
  },
  {
    model: "openai/gpt-oss-120b",
    temperature: 1,
    top_p: 1,
    max_tokens: 1024,
    chat_template_kwargs: undefined,
    timeout: "360 seconds",
  },
] as const;

// =============================================================================
// NVIDIA Config & Layers (Effect Config + Layer composition)
// =============================================================================

const nvidiaConfig = Effect.gen(function* () {
  const apiKey = yield* Config.redacted("NVIDIA_API_KEY");
  return { apiKey };
});

type TestModel = (typeof TEST_MODELS)[number];

const makeNvidiaClientLayer = (apiKey: Redacted.Redacted<string>) =>
  Layer.effect(
    OpenAiClient.OpenAiClient,
    OpenAiClient.make({
      apiUrl: NVIDIA_BASE_URL,
      apiKey,
    })
  );

const makeNvidiaLayer = (testModel: TestModel, apiKey: Redacted.Redacted<string>) => {
  const clientLayer = makeNvidiaClientLayer(apiKey);
  const modelLayer = OpenAiLanguageModel.layer({
    model: testModel.model,
    config: {
      temperature: testModel.temperature,
      top_p: testModel.top_p,
      max_tokens: testModel.max_tokens,
      ...(testModel.chat_template_kwargs !== undefined ? { chat_template_kwargs: testModel.chat_template_kwargs } : {}),
    },
  });
  return Layer.provide(modelLayer, clientLayer);
};

// =============================================================================
// Helper to create prompt from messages
// =============================================================================

const makeRiddlePrompt = () =>
  Prompt.fromMessages([
    Prompt.systemMessage({ content: TEST_SYSTEM_PROMPT_RIDDLE }),
    Prompt.userMessage({
      content: [Prompt.textPart({ text: TEST_RIDDLE_PROMPT })],
    }),
  ]);

const makeCluePrompt = () =>
  Prompt.fromMessages([
    Prompt.systemMessage({ content: TEST_SYSTEM_PROMPT_CLUE }),
    Prompt.userMessage({
      content: [Prompt.textPart({ text: TEST_CLUE_PROMPT })],
    }),
  ]);

// =============================================================================
// Test Result Types
// =============================================================================

type TestResult<T> = { readonly _tag: "Success"; readonly value: T } | { readonly _tag: "Error"; readonly error: string };

const success = <T>(value: T): TestResult<T> => ({ _tag: "Success", value });
const failure = (error: string): TestResult<never> => ({ _tag: "Error", error });

// =============================================================================
// Test Functions
// =============================================================================

// NVIDIA free-tier surfaces transient, retryable failures as plain `AiError`
// messages. We retry these a few times with exponential backoff before giving up:
//   - "Service temporarily overloaded" (internal provider capacity)
//   - "Rate limit exceeded" (free-tier RPM ceiling)
//   - "Internal provider error: Server error"
const TRANSIENT_PATTERN = /(temporarily overloaded|rate limit|internal provider error|server error)/i;

const isTransientFailure = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT_PATTERN.test(message);
};

const withTransientRetry = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.retry({
      times: 3,
      while: (error) => isTransientFailure(error),
      schedule: Schedule.exponential("2 seconds", 2),
    })
  );

const testGenerateText = (testModel: TestModel, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const lm = yield* LanguageModel.LanguageModel;
    const prompt = makeRiddlePrompt();
    const result = yield* lm.generateText({ prompt });
    return result;
  }).pipe(
    Effect.provide(makeNvidiaLayer(testModel, apiKey)),
    withTransientRetry,
    Effect.tapError((e) => Effect.logError(`[${testModel.model}] generateText failed: ${String(e)}`)),
    Effect.timeout(testModel.timeout)
  );

const testGenerateObjectRiddle = (testModel: TestModel, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const lm = yield* LanguageModel.LanguageModel;
    const prompt = makeRiddlePrompt();
    const result = yield* lm.generateObject({ prompt, schema: RiddleSchema });
    return result;
  }).pipe(
    Effect.provide(makeNvidiaLayer(testModel, apiKey)),
    withTransientRetry,
    Effect.tapError((e) => Effect.logError(`[${testModel.model}] generateObject (riddle) failed: ${String(e)}`)),
    Effect.timeout(testModel.timeout)
  );

const testGenerateObjectClue = (testModel: TestModel, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const lm = yield* LanguageModel.LanguageModel;
    const prompt = makeCluePrompt();
    const result = yield* lm.generateObject({ prompt, schema: ClueSchema });
    return result;
  }).pipe(
    Effect.provide(makeNvidiaLayer(testModel, apiKey)),
    withTransientRetry,
    Effect.tapError((e) => Effect.logError(`[${testModel.model}] generateObject (clue) failed: ${String(e)}`)),
    Effect.timeout(testModel.timeout)
  );

// Helper to run a test and convert to TestResult
const runTest = <T, E, R>(effect: Effect.Effect<T, E, R>): Effect.Effect<TestResult<T>, never, R> =>
  effect.pipe(
    Effect.map((value) => success(value)),
    Effect.catch((e) => Effect.succeed(failure(e instanceof Error ? e.message : String(e))))
  );

// =============================================================================
// Run Tests for Single Model
// =============================================================================

type ModelResult = {
  model: string;
  generateText: { success: boolean; text?: string; hasMirror?: boolean; error?: string };
  generateObjectRiddle: { success: boolean; value?: { riddle: string }; hasMirror?: boolean; error?: string };
  generateObjectClue: { success: boolean; value?: { clue: string }; hasMirror?: boolean; error?: string };
};

const runModelTest = (testModel: TestModel, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const model = testModel.model;
    yield* Effect.log(`\n${"=".repeat(60)}`);
    yield* Effect.log(`Testing: ${model}`);
    yield* Effect.log(`${"=".repeat(60)}`);

    const results: ModelResult = {
      model,
      generateText: { success: false },
      generateObjectRiddle: { success: false },
      generateObjectClue: { success: false },
    };

    // Test 1: generateText
    yield* Effect.log(`\n--- generateText (riddle) ---`);
    const textResult = yield* runTest(testGenerateText(testModel, apiKey));
    if (textResult._tag === "Success") {
      const text = textResult.value.text;
      const hasMirror = text.toLowerCase().includes("mirror");
      yield* Effect.log(`Status: SUCCESS`);
      yield* Effect.log(`Length: ${text.length} chars`);
      yield* Effect.log(`Contains "mirror": ${hasMirror ? "❌ FAIL" : "✅ PASS"}`);
      yield* Effect.log(`Output: "${text.substring(0, 200)}${text.length > 200 ? "..." : ""}"`);
      results.generateText = { success: true, text, hasMirror };
    } else {
      yield* Effect.log(`Status: FAILED - ${textResult.error}`);
      results.generateText = { success: false, error: textResult.error };
    }

    yield* Effect.sleep("1 second");

    // Test 2: generateObject with RiddleSchema
    yield* Effect.log(`\n--- generateObject (RiddleSchema) ---`);
    const riddleResult = yield* runTest(testGenerateObjectRiddle(testModel, apiKey));
    if (riddleResult._tag === "Success") {
      const obj = riddleResult.value.value;
      const hasMirror = obj.riddle.toLowerCase().includes("mirror");
      yield* Effect.log(`Status: SUCCESS`);
      yield* Effect.log(`Valid schema: ✅ PASS`);
      yield* Effect.log(`Contains "mirror": ${hasMirror ? "❌ FAIL" : "✅ PASS"}`);
      yield* Effect.log(`Riddle: "${obj.riddle}"`);
      results.generateObjectRiddle = { success: true, value: obj, hasMirror };
    } else {
      yield* Effect.log(`Status: FAILED - ${riddleResult.error}`);
      results.generateObjectRiddle = { success: false, error: riddleResult.error };
    }

    yield* Effect.sleep("1 second");

    // Test 3: generateObject with ClueSchema
    yield* Effect.log(`\n--- generateObject (ClueSchema) ---`);
    const clueResult = yield* runTest(testGenerateObjectClue(testModel, apiKey));
    if (clueResult._tag === "Success") {
      const obj = clueResult.value.value;
      const hasMirror = obj.clue.toLowerCase().includes("mirror");
      yield* Effect.log(`Status: SUCCESS`);
      yield* Effect.log(`Valid schema: ✅ PASS`);
      yield* Effect.log(`Contains "mirror": ${hasMirror ? "❌ FAIL" : "✅ PASS"}`);
      yield* Effect.log(`Clue: "${obj.clue.substring(0, 300)}${obj.clue.length > 300 ? "..." : ""}"`);
      results.generateObjectClue = { success: true, value: obj, hasMirror };
    } else {
      yield* Effect.log(`Status: FAILED - ${clueResult.error}`);
      results.generateObjectClue = { success: false, error: clueResult.error };
    }

    const passed = [results.generateText.success, results.generateObjectRiddle.success, results.generateObjectClue.success].filter(Boolean).length;

    yield* Effect.log(`\n--- SUMMARY for ${model} ---`);
    yield* Effect.log(`Tests passed: ${passed}/3`);
    yield* Effect.log(`Structured output (riddle): ${results.generateObjectRiddle.success ? "✅" : "❌"}`);
    yield* Effect.log(`Structured output (clue): ${results.generateObjectClue.success ? "✅" : "❌"}`);
    yield* Effect.log(`Schema compliance: ${results.generateObjectRiddle.success && results.generateObjectClue.success ? "✅" : "❌"}`);
    yield* Effect.log(`No forbidden word: ${!results.generateObjectRiddle.hasMirror && !results.generateObjectClue.hasMirror ? "✅" : "❌"}`);

    return results;
  });

// =============================================================================
// Main Layer & Program (following src/seed/run-migrations.ts pattern)
// =============================================================================

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, NodeHttpClient.layerUndici);

const main = Effect.gen(function* () {
  const { apiKey } = yield* nvidiaConfig;

  yield* Effect.log("Starting NVIDIA NIM + Effect AI integration tests");
  yield* Effect.log(`Base URL: ${NVIDIA_BASE_URL}`);
  yield* Effect.log(`Models to test: ${TEST_MODELS.length}`);
  yield* Effect.log("Running sequentially to respect rate limits...\n");

  const allResults: Record<string, ModelResult> = {};

  for (const testModel of TEST_MODELS) {
    const result = yield* runModelTest(testModel, apiKey);
    allResults[testModel.model] = result;

    yield* Effect.log(`\nWaiting 3 seconds before next model...`);
    yield* Effect.sleep("3 seconds");
  }

  // Final Summary
  yield* Effect.log(`\n${"=".repeat(60)}`);
  yield* Effect.log(`FINAL SUMMARY`);
  yield* Effect.log(`${"=".repeat(60)}`);

  for (const [model, result] of Object.entries(allResults)) {
    const passed = [result.generateText.success, result.generateObjectRiddle.success, result.generateObjectClue.success].filter(Boolean).length;

    const status = passed === 3 ? "✅ FULL PASS" : passed >= 2 ? "⚠️ PARTIAL" : passed >= 1 ? "⚠️ MINIMAL" : "❌ FAIL";
    const structOk = result.generateObjectRiddle.success && result.generateObjectClue.success ? "✅" : "❌";
    const noMirror = !result.generateObjectRiddle.hasMirror && !result.generateObjectClue.hasMirror ? "✅" : "❌";

    yield* Effect.log(`${status} | ${model}`);
    yield* Effect.log(`  Structured output: ${structOk} | No "mirror": ${noMirror} | ${passed}/3 tests`);

    if (result.generateObjectRiddle.success) {
      yield* Effect.log(`  Riddle: "${result.generateObjectRiddle.value!.riddle.substring(0, 100)}..."`);
    }
    if (result.generateObjectClue.success) {
      yield* Effect.log(`  Clue: "${result.generateObjectClue.value!.clue.substring(0, 100)}..."`);
    }
  }

  const fullPass = Object.entries(allResults)
    .filter(([, r]) => r.generateText.success && r.generateObjectRiddle.success && r.generateObjectClue.success)
    .map(([m]) => m);

  yield* Effect.log(`\n${"=".repeat(60)}`);
  yield* Effect.log(`RECOMMENDATION`);
  yield* Effect.log(`${"=".repeat(60)}`);

  if (fullPass.length >= 3) {
    yield* Effect.log(`✅ STRONG CANDIDATES (${fullPass.length} models fully working):`);
    for (const m of fullPass) {
      yield* Effect.log(`  - ${m}`);
    }
    yield* Effect.log(`\n→ PROCEED with NVIDIA migration using these models in ExecutionPlan fallback`);
  } else if (fullPass.length >= 1) {
    yield* Effect.log(`⚠️ LIMITED CANDIDATES (${fullPass.length} model(s) fully working):`);
    for (const m of fullPass) {
      yield* Effect.log(`  - ${m}`);
    }
    yield* Effect.log(`\n→ Consider if single model + fallback to other provider is acceptable`);
  } else {
    yield* Effect.log(`❌ NO MODELS FULLY WORKING`);
    yield* Effect.log(`\n→ NVIDIA path not viable. Consider:`);
    yield* Effect.log(`   1. Custom Google Effect provider (preserves free tier + current models)`);
    yield* Effect.log(`   2. OpenRouter Free Gemma (verified structured output)`);
    yield* Effect.log(`   3. Stay with AI SDK + Google AI Studio`);
  }

  return allResults;
}).pipe(Effect.provide(MainLayer));

// Use managed Node.js runtime for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
