// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcOverdriveHacks } from "./requests";
import { WordEnrichment } from "@/services/word-enrichment.server";
import { makeRpcHandler } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

// constants
import { RPC_OVERDRIVE_HACKS_PATH } from "@/domain/constants";

// Enrichment lives behind the service; this layer is wiring only
const RpcOverdriveHacksLayer = RpcOverdriveHacks.toLayer({
  fetchOverride: ({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage }) =>
    Effect.flatMap(WordEnrichment, (enrichment) => enrichment.override(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage)),

  fetchOverrideAudio: fetchSpeechAudio,
});

const RpcOverdriveHacksLayerWithServices = RpcOverdriveHacksLayer.pipe(Layer.provide(WordEnrichment.layer), Layer.provide(OpenRouter.layer));

export const handler = makeRpcHandler(RpcOverdriveHacks, RPC_OVERDRIVE_HACKS_PATH, RpcOverdriveHacksLayerWithServices);
