import "dotenv/config";

// services, features, and other libraries
import { Effect } from "effect";
import { AiClientsWithHttp, makeFallbackPlan } from "@/domain/fallback-plan";
import { generateRiddle, planFor, runCase } from "./riddle-proof";
import { runSeed } from "./runtime";

// constants
import { PROOF_TEST_CASES } from "./riddle-proof";
import { CLOUDFLARE_AI_MODELS } from "@/domain/fallback-plan";

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect AI + Cloudflare Workers AI generateObject end-to-end...\n");

  // The production Cloudflare rungs, read from the ladder data itself so this
  // proof can never exercise a different set of models than production runs
  // `Effect.forEach` rather than a nested `for`: every case runs sequentially
  // (the default), and the loop is interruptible as one Effect instead of a bare
  // imperative loop inside a fiber-safe program
  yield* Effect.forEach(CLOUDFLARE_AI_MODELS, ({ id, config }) =>
    Effect.forEach(
      PROOF_TEST_CASES,
      ({ theSecretWord, solutionsLanguage }) =>
        runCase(
          `${id} / ${solutionsLanguage}`,
          theSecretWord,
          generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(planFor(id, config)))
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
        generateRiddle(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(makeFallbackPlan))
      ),
    { discard: true }
  );
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
