import "dotenv/config";

// services, features, and other libraries
import { Effect, ExecutionPlan, Schedule } from "effect";
import { OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { AiClientsWithHttp, makeFallbackPlan2 } from "@/domain/fallback-plan2";
import { generateRiddle, runCase } from "./riddle-proof";
import { runSeed } from "./runtime";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// The three Cloudflare models in the production fallback ladder. There is no
// list to import: `makeFallbackPlan2` builds its steps through the `aiStep`
// helper, so this table mirrors it and must be updated by hand when the ladder
// changes
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

// One plan step: the model to try, a single attempt, and a bounded retry
const planFor = (id: string, config: typeof OpenAiLanguageModel.Config.Service) =>
  ExecutionPlan.make({
    provide: OpenAiLanguageModel.model(id, config),
    attempts: 1,
    schedule: Schedule.exponential("1 second", 2),
  });

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect AI + Cloudflare Workers AI generateObject end-to-end...\n");

  for (const model of CLOUDFLARE_MODELS) {
    for (const { theSecretWord, solutionsLanguage } of TEST_CASES) {
      yield* runCase(
        `${model.id} / ${solutionsLanguage}`,
        theSecretWord,
        generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(planFor(model.id, model.config)))
      );
    }
  }

  yield* Effect.log("**********************\nTesting the production Cloudflare-first fallback ladder...\n");

  for (const { theSecretWord, solutionsLanguage } of TEST_CASES) {
    yield* runCase(
      `production ladder / ${solutionsLanguage}`,
      theSecretWord,
      generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(makeFallbackPlan2))
    );
  }
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
