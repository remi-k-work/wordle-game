import "dotenv/config";

// services, features, and other libraries
import { Cause, Duration, Effect, ExecutionPlan, Layer, Option, Schedule, Schema } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { LanguageModel, Model, Prompt } from "effect/ai";
import { OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";
import { SeedLayer } from "./runtime";

// assets
import definitionsPlJson from "@/assets/data/definitions-pl.json";

const MainLayer = Layer.mergeAll(SeedLayer, AiClientsWithHttp);

// Validate the build-time definition asset once, mirroring the RPC handler
const Definitions = Schema.Record(Schema.String, Schema.String);
const DEFINITIONS_PL = Schema.decodeSync(Definitions)(definitionsPlJson);

class MissingDefinitionError extends Schema.TaggedError<MissingDefinitionError, { readonly brand: unique symbol }>()("MissingDefinitionError", {
  theSecretWord: Schema.String,
}) {}

// Exotic Polish solutions are the cases where the model is most likely to
// guess the wrong sense or hallucinate a meaning without the dictionary context
const TEST_WORDS = ["ABAJA", "ABCUG", "ABSTA", "ADAKS"] as const;

const LLAMA_LABEL = "Llama 3.3 70B (Cloudflare)";
const LLAMA_PLAN = ExecutionPlan.make({
  provide: OpenAiLanguageModel.model("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { strictJsonSchema: true }),
  attempts: 1,
  schedule: Schedule.exponential("1 second", 2),
});

const GEMMA_LABEL = "Gemma 4 26B (Cloudflare)";
const GEMMA_PLAN = ExecutionPlan.make({
  provide: OpenAiLanguageModel.model("@cf/google/gemma-4-26b-a4b-it", {
    strictJsonSchema: true,
    chat_template_kwargs: { enable_thinking: false },
  }),
  attempts: 1,
  schedule: Schedule.exponential("1 second", 2),
});

const getDefinition = (theSecretWord: string) =>
  Option.fromNullishOr(DEFINITIONS_PL[theSecretWord]).pipe(Effect.fromOption(() => new MissingDefinitionError({ theSecretWord })));

// Mirrors the single-field generation flow so the A/B uses the exact production
// prompt and schema construction, while exposing the model that actually ran
const generateRiddle = Effect.fn("generateRiddle")(function* (theSecretWord: string, wordDefinition: Option.Option<string>) {
  const languageModel = yield* LanguageModel.LanguageModel;
  const modelName = yield* Model.ModelName;
  const options = riddleGenerationOptions(theSecretWord, "Pl", wordDefinition);
  const schema = Schema.Struct({ riddle: Schema.Trim.pipe(Schema.annotate({ description: options.description })) });
  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: options.instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
  ]);

  const { value } = yield* languageModel.generateObject({ prompt, schema });

  return { modelName, riddle: value.riddle } as const;
});

const runCase = <E, R>(label: string, theSecretWord: string, effect: Effect.Effect<{ readonly modelName: string; readonly riddle: string }, E, R>) =>
  effect.pipe(
    Effect.timed,
    Effect.matchEffect({
      onFailure: (error) => Effect.logError(`Case '${label}' failed. ${Cause.pretty(Cause.fail(error))}`),

      onSuccess: ([duration, result]) => {
        // Exact-match check only; Polish inflections still need a human review
        const containsSecretWord = result.riddle.toLocaleUpperCase("pl-PL").includes(theSecretWord.toLocaleUpperCase("pl-PL"));
        const warning = containsSecretWord ? " [EXACT SECRET WORD FOUND]" : "";

        return Effect.log(`Case '${label}' succeeded with '${result.modelName}' in ${Duration.toMillis(duration)}ms.${warning}\n${result.riddle}\n`);
      },
    })
  );

const main = Effect.gen(function* () {
  yield* Effect.log("A/B: Polish riddles — baseline prompt vs definition-aware prompt\n");

  for (const theSecretWord of TEST_WORDS) {
    const wordDefinition = yield* getDefinition(theSecretWord);

    yield* Effect.log(`=== ${theSecretWord} ===\nDefinition: ${wordDefinition}\n`);

    yield* runCase(`${LLAMA_LABEL} / baseline`, theSecretWord, generateRiddle(theSecretWord, Option.none()).pipe(Effect.withExecutionPlan(LLAMA_PLAN)));
    yield* runCase(
      `${LLAMA_LABEL} / + definition`,
      theSecretWord,
      generateRiddle(theSecretWord, Option.some(wordDefinition)).pipe(Effect.withExecutionPlan(LLAMA_PLAN))
    );

    yield* runCase(`${GEMMA_LABEL} / baseline`, theSecretWord, generateRiddle(theSecretWord, Option.none()).pipe(Effect.withExecutionPlan(GEMMA_PLAN)));
    yield* runCase(
      `${GEMMA_LABEL} / + definition`,
      theSecretWord,
      generateRiddle(theSecretWord, Option.some(wordDefinition)).pipe(Effect.withExecutionPlan(GEMMA_PLAN))
    );
  }
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
