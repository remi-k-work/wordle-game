import "dotenv/config";

// services, features, and other libraries
import { Effect } from "effect";
import { AiClientsWithHttp, makeFallbackPlan2 } from "@/domain/fallback-plan2";
import { generateRiddle, planFor, runCase } from "./riddle-proof";
import { runSeed } from "./runtime";

// constants
import { PROOF_TEST_CASES } from "./riddle-proof";

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

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect AI + Cloudflare Workers AI generateObject end-to-end...\n");

  // `Effect.forEach` rather than a nested `for`: every case runs sequentially
  // (the default), and the loop is interruptible as one Effect instead of a bare
  // imperative loop inside a fiber-safe program
  yield* Effect.forEach(CLOUDFLARE_MODELS, (model) =>
    Effect.forEach(
      PROOF_TEST_CASES,
      ({ theSecretWord, solutionsLanguage }) =>
        runCase(
          `${model.id} / ${solutionsLanguage}`,
          theSecretWord,
          generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(planFor(model.id, model.config)))
        ),
      { discard: true }
    )
  );

  yield* Effect.log("**********************\nTesting the production Cloudflare-first fallback ladder...\n");

  yield* Effect.forEach(
    PROOF_TEST_CASES,
    ({ theSecretWord, solutionsLanguage }) =>
      runCase(
        `production ladder / ${solutionsLanguage}`,
        theSecretWord,
        generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(makeFallbackPlan2))
      ),
    { discard: true }
  );
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
