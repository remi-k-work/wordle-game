// services, features, and other libraries
import { Effect, Layer, Option, String } from "effect";
import { RpcGame } from "./requests";
import { GameContent } from "@/features/game/services/game-content";
import { generateRiddle } from "@/features/game/domain/riddle";
import { formatTextForTTS } from "@/domain/formatters";
import { AiClientsWithHttp } from "@/domain/fallback-plan";
import { makeRpcHandler, withAiFallback } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

// constants
import { RPC_GAME_PATH } from "@/domain/constants";

// Content RPCs are pass-throughs to the static asset service; the AI-backed
// riddle still reads the same service's raw dictionary definition for its prompt
const RpcGameLayer = RpcGame.toLayer({
  fetchSolutions: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.solutions(solutionsLanguage))),

  // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
  fetchDictionary: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.dictionary(solutionsLanguage))),
  fetchKeypad: ({ solutionsLanguage }) => Effect.map(GameContent, (content) => Option.some(content.keypad(solutionsLanguage))),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    Effect.flatMap(GameContent, (content) =>
      withAiFallback(
        generateRiddle(theSecretWord, solutionsLanguage, content.definition(theSecretWord, solutionsLanguage)),
        Effect.succeedSome("No riddle available in the AI off mode.")
      )
    ),

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

const RpcGameLayerWithAi = RpcGameLayer.pipe(Layer.provide(AiClientsWithHttp), Layer.provide(OpenRouter.layer), Layer.provide(GameContent.layer));

export const handler = makeRpcHandler(RpcGame, RPC_GAME_PATH, RpcGameLayerWithAi);
