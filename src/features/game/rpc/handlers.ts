// services, features, and other libraries
import { Config, Effect, Layer, Option } from "effect";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { HttpServer } from "@effect/platform";
import { RpcGame } from "./requests";
import { generateRiddle } from "@/features/game/domain";
import { GoogleClient } from "@effect/ai-google";
import { NodeHttpClient } from "@effect/platform-node";

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
  fetchSolutions: ({ solutionsLanguage }) => Effect.succeed(solutionsLanguage === "En" ? solutionsEnJson : solutionsPlJson),
  fetchDictionary: ({ solutionsLanguage }) => Effect.succeed(solutionsLanguage === "En" ? dictionaryEnJson : dictionaryPlJson),
  fetchKeypad: ({ solutionsLanguage }) => Effect.succeed(solutionsLanguage === "En" ? keypadEnJson : keypadPlJson),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    Effect.gen(function* () {
      // Do not generate a riddle in the AI off mode to avoid rate limits and unnecessary token usage
      const aiSwitch = yield* Config.literal("off")("AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));
      if (aiSwitch === "off") return yield* Effect.sleep("5 seconds").pipe(Effect.as("No riddle available in the AI off mode."));
      return yield* generateRiddle(theSecretWord, solutionsLanguage);
    }).pipe(
      Effect.tapError((error) => Effect.logError(`[fetchRiddle] recovering from ${error._tag}`)),
      Effect.orElseSucceed(() => "Riddle unavailable. You are on your own!")
    ),

  wordDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.succeed(Option.fromNullable(solutionsLanguage === "En" ? DEFINITIONS_EN[theSecretWord] : DEFINITIONS_PL[theSecretWord]).pipe(Option.getOrNull)),
}).pipe(Layer.provideMerge(Layer.provide(GoogleClient.layerConfig({ apiKey: Config.redacted("GOOGLE_GENERATIVE_AI_API_KEY") }), NodeHttpClient.layerUndici)));

export const { dispose, handler } = RpcServer.toWebHandler(RpcGame, {
  layer: Layer.mergeAll(RpcGameLayer, RpcSerialization.layerJson, HttpServer.layerContext),
  disableFatalDefects: true,
});
