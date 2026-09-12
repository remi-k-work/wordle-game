// services, features, and other libraries
import { Effect, HashSet, Layer, Option } from "effect";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { NodeHttpClient } from "@effect/platform-node";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcGame } from "./requests";
import { generateRiddle, matchLanguage } from "@/features/game/domain";
import { OpenRouterClientLayer } from "@/domain";
import { readAiSwitch } from "@/lib/rpc";
import { OpenRouter } from "@/services/open-router";
import { formatTextForTTS } from "@/lib/formatters";

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
const DEFINITIONS_EN = definitionsEnJson as Record<string, string | null>;
const DEFINITIONS_PL = definitionsPlJson as Record<string, string | null>;

const RpcGameLayer = RpcGame.toLayer({
  fetchSolutions: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, solutionsEnJson, solutionsPlJson)),

  // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
  fetchDictionary: ({ solutionsLanguage }) => Effect.succeedSome(HashSet.fromIterable(matchLanguage(solutionsLanguage, dictionaryEnJson, dictionaryPlJson))),
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

  fetchRiddleAudio: ({ input }) =>
    Effect.gen(function* () {
      const { generateSpeech } = yield* OpenRouter;
      const { audioData } = yield* generateSpeech({ input });

      return yield* Effect.succeedSome(audioData);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),
});

const OpenRouterClientWithHttp = OpenRouterClientLayer.pipe(Layer.provide(NodeHttpClient.layerUndici));
const RpcGameLayerWithOpenRouter = RpcGameLayer.pipe(Layer.provide(OpenRouterClientWithHttp), Layer.provide(OpenRouter.layer));

const RpcLayer = RpcServer.layerHttp({
  group: RpcGame,
  path: "/api/rpc/game",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcGameLayerWithOpenRouter, RpcSerialization.layerSchemaBinary(), HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
