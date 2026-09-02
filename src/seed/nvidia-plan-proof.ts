import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";

// domain
import { generateNvidiaSingleField, makeNvidiaClientLayer } from "@/domain";

const RIDDLE_INSTRUCTIONS = `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "MIRROR".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question.
2. Reference at least one concrete real-world domain so a player can guess it.
3. NEVER reveal the secret word directly.
4. Keep it plain text, suitable for Text-To-Speech.
5. SELF-VERIFY: Ensure the word "MIRROR" is completely absent.
`;

const CLUE_INSTRUCTIONS = `
You are an elite analytical AI assistant in a high-stakes word puzzle game.
The secret word is "MIRROR".

CRITICAL RULES:
1. Provide a highly insightful, contextual clue about the secret word.
2. NEVER reveal the secret word directly.
3. Keep it plain text, suitable for Text-To-Speech.
4. SELF-VERIFY: Ensure the word "MIRROR" is completely absent.
`;

const NvidiaClientWithHttp = Layer.provide(makeNvidiaClientLayer(), NodeHttpClient.layerUndici);
const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, NvidiaClientWithHttp);

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + NVIDIA NIM `ExecutionPlan` fallback end-to-end...\n");

  const riddle = yield* generateNvidiaSingleField({
    temperature: 0.9,
    instructions: RIDDLE_INSTRUCTIONS,
    prompt: "Craft the riddle now.",
    fieldName: "riddle",
    description: "Plain prose, a short riddle (1-3 sentences) ending in a question, TTS-friendly.",
  });

  const hasMirrorRiddle = riddle.toLowerCase().includes("mirror");
  yield* Effect.log(`RIDDLE (has "mirror": ${hasMirrorRiddle}):\n"${riddle}"\n`);

  const clue = yield* generateNvidiaSingleField({
    temperature: 0.5,
    instructions: CLUE_INSTRUCTIONS,
    prompt: "Craft the override clue now based on no prior guesses (Turn 1).",
    fieldName: "clue",
    description: "A highly descriptive clue in plain text only, TTS-friendly.",
  });

  const hasMirrorClue = clue.toLowerCase().includes("mirror");
  yield* Effect.log(`CLUE (has "mirror": ${hasMirrorClue}):\n"${clue}"\n`);

  if (hasMirrorRiddle || hasMirrorClue) {
    yield* Effect.logError("❌ Forbidden word leaked into output.");
  } else {
    yield* Effect.log("✅ Both riddle and clue generated via NVIDIA ExecutionPlan fallback without leaking the secret word.");
  }
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
