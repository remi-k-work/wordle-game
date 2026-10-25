// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcOverdriveHacks } from "./requests";
import { generateOverride } from "@/features/overdrive-hacks/domain/override2";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { makeRpcHandler, withAiFallback } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

const RpcOverdriveHacksLayer = RpcOverdriveHacks.toLayer({
  fetchOverride: ({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage }) =>
    withAiFallback(
      generateOverride(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage),
      Effect.succeedSome("No override available in the AI off mode.")
    ),

  fetchOverrideAudio: fetchSpeechAudio,
});

const RpcOverdriveHacksLayerWithAi = RpcOverdriveHacksLayer.pipe(Layer.provide(AiClientsWithHttp), Layer.provide(OpenRouter.layer));

export const handler = makeRpcHandler(RpcOverdriveHacks, "/api/rpc/overdrive-hacks", RpcOverdriveHacksLayerWithAi);
