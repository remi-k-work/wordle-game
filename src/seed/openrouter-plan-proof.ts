import "dotenv/config";

// services, features, and other libraries
import { Effect, Option } from "effect";
import { generateSingleField2 } from "@/domain/generate-single-field2";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";
import { runSeed } from "./runtime";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// Both languages run the same pipeline, so they differ only by their literals
const TEST_CASES = [
  { theSecretWord: "MIRROR", solutionsLanguage: "En" },
  { theSecretWord: "LUSTRO", solutionsLanguage: "Pl" },
] as const satisfies ReadonlyArray<{
  readonly theSecretWord: string;
  readonly solutionsLanguage: SolutionsLanguage;
}>;

// Generation failures degrade to a placeholder so the proof always reports
// something for each language instead of aborting on the first one
const proveLanguage = ({ theSecretWord, solutionsLanguage }: (typeof TEST_CASES)[number]) =>
  generateSingleField2(riddleGenerationOptions(theSecretWord, solutionsLanguage)).pipe(
    Effect.tapError(Effect.logError),
    Effect.orElseSucceed(() => Option.some("Riddle unavailable. You are on your own!"))
  );

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + OpenRouter `ExecutionPlan` fallback end-to-end...\n");

  for (const testCase of TEST_CASES) {
    const riddle = yield* proveLanguage(testCase);
    yield* Effect.log(`${Option.getOrUndefined(riddle)}\n**********************\n`);
  }
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
