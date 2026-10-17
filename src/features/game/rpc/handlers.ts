import "server-only";

// services, features, and other libraries
import { Array, Effect, HashSet, Layer, Option, Random } from "effect";
import { NodeHttpClient } from "@effect/platform-node";
import { RpcGame } from "./requests";
import { matchLanguage } from "@/features/game/domain";
import { generateRiddle } from "@/features/game/domain/riddle2";
import { OpenRouter } from "@/services/open-router";
import { formatTextForTTS } from "@/domain/formatters";
import { OpenRouterClientLayer } from "@/domain/fallback-plan2";
import { makeRpcHandler, readAiSwitch } from "@/domain/helpers";

// assets
import solutionsEnJson from "@/assets/data/solutions-en.json";
import solutionsPlJson from "@/assets/data/solutions-pl.json";
import keypadEnJson from "@/assets/data/keypad-en.json";
import keypadPlJson from "@/assets/data/keypad-pl.json";
import definitionsEnJson from "@/assets/data/definitions-en.json";
import definitionsPlJson from "@/assets/data/definitions-pl.json";
import dictionaryEnJson from "@/assets/data/dictionary-en.json";
import dictionaryPlJson from "@/assets/data/dictionary-pl.json";

// constants
import { VOICES_PL } from "@/domain/constants";

const DEFINITIONS_EN = definitionsEnJson as Record<string, string | null>;
const DEFINITIONS_PL = definitionsPlJson as Record<string, string | null>;

// Built once at module scope: hashing 30,000+ words into a HashSet is far too
// expensive to repeat on every request (server-hoist-static-io)
const DICTIONARY_EN = HashSet.fromIterable(dictionaryEnJson);
const DICTIONARY_PL = HashSet.fromIterable(dictionaryPlJson);

const RpcGameLayer = RpcGame.toLayer({
  fetchSolutions: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, solutionsEnJson, solutionsPlJson)),

  // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
  fetchDictionary: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, DICTIONARY_EN, DICTIONARY_PL)),
  fetchKeypad: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, keypadEnJson, keypadPlJson)),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    Effect.gen(function* () {
      // Do not generate a riddle in the AI off mode to avoid rate limits and unnecessary token usage
      const aiSwitch = yield* readAiSwitch;
      if (aiSwitch === "off") return yield* Effect.succeedSome("No riddle available in the AI off mode.");
      return yield* generateRiddle(theSecretWord, solutionsLanguage);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),

  fetchDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.succeed(
      Option.fromNullishOr(matchLanguage(solutionsLanguage, DEFINITIONS_EN[theSecretWord], DEFINITIONS_PL[theSecretWord])).pipe(Option.map(formatTextForTTS))
    ),

  fetchRiddleAudio: ({ input, solutionsLanguage }) =>
    Effect.gen(function* () {
      const { generateSpeech } = yield* OpenRouter;
      const randomIndex = yield* Random.nextIntBetween(0, VOICES_PL.length);
      const voice = matchLanguage(solutionsLanguage, Option.none(), Array.get(VOICES_PL, randomIndex)).valueOrUndefined;

      const { audioData } = yield* generateSpeech(voice === undefined ? { input } : { input, voice });

      return yield* Effect.succeedSome(audioData);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),

  fetchWordDefinitionAudio: ({ input, solutionsLanguage }) =>
    Effect.gen(function* () {
      const { generateSpeech } = yield* OpenRouter;
      const randomIndex = yield* Random.nextIntBetween(0, VOICES_PL.length);
      const voice = matchLanguage(solutionsLanguage, Option.none(), Array.get(VOICES_PL, randomIndex)).valueOrUndefined;

      const { audioData } = yield* generateSpeech(voice === undefined ? { input } : { input, voice });

      return yield* Effect.succeedSome(audioData);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),
});

const OpenRouterClientWithHttp = OpenRouterClientLayer.pipe(Layer.provide(NodeHttpClient.layerUndici));
const RpcGameLayerWithOpenRouter = RpcGameLayer.pipe(Layer.provide(OpenRouterClientWithHttp), Layer.provide(OpenRouter.layer));

export const handler = makeRpcHandler(RpcGame, "/api/rpc/game", RpcGameLayerWithOpenRouter);
