import "dotenv/config";

// services, features, and other libraries
import { Effect, Option } from "effect";
import { generateSingleField2 } from "@/domain/generate-single-field2";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";
import { runSeed } from "./runtime";

// constants
import { PROOF_TEST_CASES } from "./riddle-proof";

// Generation failures degrade to a placeholder so the proof always reports
// something for each language instead of aborting on the first one
const proveLanguage = ({ theSecretWord, solutionsLanguage }: (typeof PROOF_TEST_CASES)[number]) =>
  generateSingleField2(riddleGenerationOptions(theSecretWord, solutionsLanguage)).pipe(
    Effect.tapError(Effect.logError),
    Effect.orElseSucceed(() => Option.some("Riddle unavailable. You are on your own!"))
  );

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + OpenRouter `ExecutionPlan` fallback end-to-end...\n");

  // Sequential (the `Effect.forEach` default), and interruptible as one Effect
  yield* Effect.forEach(
    PROOF_TEST_CASES,
    (testCase) =>
      proveLanguage(testCase).pipe(
        // Generation failures degrade to a placeholder so the proof always reports
        // something for each language instead of aborting on the first one
        Effect.tap((riddle) => Effect.log(`${Option.getOrUndefined(riddle)}\n**********************\n`))
      ),
    { discard: true }
  );
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
