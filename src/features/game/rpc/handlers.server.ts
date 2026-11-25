// services, features, and other libraries
import { Effect, Layer, Option, String } from "effect";
import { RpcGame } from "./requests";
import { GameContent } from "@/features/game/services/game-content";
import { WordEnrichment } from "@/services/word-enrichment.server";
import { formatTextForTTS } from "@/domain/formatters";
import { makeRpcHandler } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

// constants
import { RPC_GAME_PATH } from "@/domain/constants";

// Content and AI enrichment both live behind services; this layer is wiring only
const RpcGameLayer = RpcGame.toLayer({
  fetchSolutions: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.solutions(solutionsLanguage))),

  // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
  fetchDictionary: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.dictionary(solutionsLanguage))),
  fetchKeypad: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.keypad(solutionsLanguage))),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    Effect.gen(function* () {
      const content = yield* GameContent;
      const enrichment = yield* WordEnrichment;
      return yield* enrichment.riddle(theSecretWord, solutionsLanguage, content.definition(theSecretWord, solutionsLanguage));
    }),

  fetchDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.map(GameContent, (content) =>
      // A definition of only markdown/whitespace normalizes to "", which would
      // violate the declared success schema (`Option(NonEmpty)`): `liftPredicate`
      // drops it so the client decodes a plain None (same policy the AI path applies)
      Option.flatMap(content.definition(theSecretWord, solutionsLanguage), (definition) =>
        Option.liftPredicate(formatTextForTTS(definition), String.isNonEmpty)
      )
    ),

  fetchRiddleAudio: fetchSpeechAudio,
  fetchWordDefinitionAudio: fetchSpeechAudio,
});

const RpcGameLayerWithServices = RpcGameLayer.pipe(Layer.provide(WordEnrichment.layer), Layer.provide(OpenRouter.layer), Layer.provide(GameContent.layer));

export const handler = makeRpcHandler(RpcGame, RPC_GAME_PATH, RpcGameLayerWithServices);
