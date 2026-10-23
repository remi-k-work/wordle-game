import "dotenv/config";

// services, features, and other libraries
import { Cause, Duration, Effect, ExecutionPlan, Layer, Logger, Schedule, Schema } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { LanguageModel, Model, Prompt } from "effect/ai";
import { OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { AiClientsWithHttp, makeFallbackPlan2 } from "@/domain/fallback-plan2";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, AiClientsWithHttp);

// The three Cloudflare models used by the production fallback ladder; Gemma
// thinking is disabled explicitly to keep responses fast; GPT-OSS uses a low
// reasoning budget; Llama 3.3 supports JSON mode directly
const CLOUDFLARE_MODELS = [
  {
    id: "@cf/google/gemma-4-26b-a4b-it",
    config: { strictJsonSchema: true, chat_template_kwargs: { enable_thinking: false } },
  },
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    config: { strictJsonSchema: true },
  },
  {
    id: "@cf/openai/gpt-oss-120b",
    config: { strictJsonSchema: true, reasoning_effort: "low" },
  },
] as const;

const TEST_CASES = [
  { theSecretWord: "MIRROR", solutionsLanguage: "En" },
  { theSecretWord: "LUSTRO", solutionsLanguage: "Pl" },
] as const satisfies ReadonlyArray<{
  readonly theSecretWord: string;
  readonly solutionsLanguage: SolutionsLanguage;
}>;

// Mirrors the single-field generation flow so the proof exercises the same
// prompt/schema construction as production, while also exposing the model that
// actually handled the request
const generateRiddle = (theSecretWord: string, solutionsLanguage: SolutionsLanguage) =>
  Effect.gen(function* () {
    const languageModel = yield* LanguageModel.LanguageModel;
    const modelName = yield* Model.ModelName;
    const options = riddleGenerationOptions(theSecretWord, solutionsLanguage);
    const schema = Schema.Struct({ riddle: Schema.Trim.pipe(Schema.annotate({ description: options.description })) });
    const prompt = Prompt.fromMessages([
      Prompt.systemMessage({ content: options.instructions }),
      Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
    ]);

    const { value } = yield* languageModel.generateObject({ prompt, schema });

    return { modelName, riddle: value.riddle } as const;
  });

const runCase = <A extends { readonly modelName: string; readonly riddle: string }, E, R>(label: string, effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.timed,
    Effect.matchEffect({
      onFailure: (error) => Effect.logError(`Case '${label}' failed. ${Cause.pretty(Cause.fail(error))}`),
      onSuccess: ([duration, result]) =>
        Effect.log(`Case '${label}' succeeded with '${result.modelName}' in ${Duration.toMillis(duration)}ms.\n${result.riddle}\n`),
    })
  );

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect AI + Cloudflare Workers AI generateObject end-to-end...\n");

  for (const model of CLOUDFLARE_MODELS) {
    for (const { theSecretWord, solutionsLanguage } of TEST_CASES) {
      const plan = ExecutionPlan.make({
        provide: OpenAiLanguageModel.model(model.id, model.config),
        attempts: 1,
        schedule: Schedule.exponential("1 second", 2),
      });

      yield* runCase(`${model.id} / ${solutionsLanguage}`, generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(plan)));
    }
  }

  yield* Effect.log("**********************\nTesting the production Cloudflare-first fallback ladder...\n");

  for (const { theSecretWord, solutionsLanguage } of TEST_CASES) {
    yield* runCase(
      `production ladder / ${solutionsLanguage}`,
      generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(makeFallbackPlan2))
    );
  }
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
