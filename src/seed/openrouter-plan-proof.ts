import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger, Option } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { generateSingleField2 } from "@/domain/generate-single-field2";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, AiClientsWithHttp);

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + OpenRouter `ExecutionPlan` fallback end-to-end...\n");

  const riddleEn = yield* generateSingleField2(riddleGenerationOptions("MIRROR", "En")).pipe(
    Effect.tapError(Effect.logError),
    Effect.orElseSucceed(() => Option.some("Riddle unavailable. You are on your own!"))
  );

  yield* Effect.log(`${riddleEn.valueOrUndefined}\n`);
  yield* Effect.log("**********************\n");

  const riddlePl = yield* generateSingleField2(riddleGenerationOptions("LUSTRO", "Pl")).pipe(
    Effect.tapError(Effect.logError),
    Effect.orElseSucceed(() => Option.some("Riddle unavailable. You are on your own!"))
  );

  yield* Effect.log(`${riddlePl.valueOrUndefined}\n`);
  yield* Effect.log("**********************\n");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
