
// services, features, and other libraries
import { Effect, Layer, Option } from "effect";
import { RpcOverdriveHacks } from "./requests";
import { generateOverride } from "@/features/overdrive-hacks/domain/override2";
import { OpenRouterClientWithHttp } from "@/domain/fallback-plan2";
import { makeRpcHandler, withAiEnabled } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

const RpcOverdriveHacksLayer = RpcOverdriveHacks.toLayer({
  fetchOverride: ({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage }) =>
    withAiEnabled(
      generateOverride(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage),
      Effect.succeedSome("No override available in the AI off mode.")
    ).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),

  fetchOverrideAudio: fetchSpeechAudio,
});

const RpcOverdriveHacksLayerWithOpenRouter = RpcOverdriveHacksLayer.pipe(Layer.provide(OpenRouterClientWithHttp), Layer.provide(OpenRouter.layer));

export const handler = makeRpcHandler(RpcOverdriveHacks, "/api/rpc/overdrive-hacks", RpcOverdriveHacksLayerWithOpenRouter);
