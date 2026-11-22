import "dotenv/config";

// services, features, and other libraries
import { Effect, Option } from "effect";
import { generateSingleField } from "@/domain/generate-single-field";
import { AiClientsWithHttp } from "@/domain/fallback-plan";
import { riddleGenerationOptions } from "@/features/game/domain/riddle";
import { runSeed } from "./runtime";

// constants
import { PROOF_TEST_CASES } from "./riddle-proof";

// Generation failures degrade to a placeholder so the proof always reports
// something for each language instead of aborting on the first one. Both the
// typed-error path and the `None` (empty output) path land on the same fallback
const FALLBACK_RIDDLE = "Riddle unavailable. You are on your own!";
const proveLanguage = ({ theSecretWord, solutionsLanguage }: (typeof PROOF_TEST_CASES)[number]) =>
  Effect.matchEffect(generateSingleField(riddleGenerationOptions(theSecretWord, solutionsLanguage)), {
    onFailure: (error) => Effect.as(Effect.logError(error), FALLBACK_RIDDLE),
    onSuccess: (riddle) => Effect.succeed(Option.getOrElse(riddle, () => FALLBACK_RIDDLE)),
  });

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + OpenRouter `ExecutionPlan` fallback end-to-end...\n");

  // Sequential (the `Effect.forEach` default), and interruptible as one Effect
  yield* Effect.forEach(
    PROOF_TEST_CASES,
    (testCase) => proveLanguage(testCase).pipe(Effect.tap((riddle) => Effect.log(`${riddle}\n**********************\n`))),
    { discard: true }
  );
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
