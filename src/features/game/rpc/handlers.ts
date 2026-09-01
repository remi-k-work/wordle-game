// services, features, and other libraries
import { Effect, Layer, Option } from "effect";
import { matchLanguage } from "@/features/game/domain";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcGame } from "./requests";
import { generateRiddle } from "@/features/game/domain";
import { readAiSwitch } from "@/lib/rpc";

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
  fetchSolutions: ({ solutionsLanguage }) => Effect.succeed(matchLanguage(solutionsLanguage, solutionsEnJson, solutionsPlJson)),
  fetchDictionary: ({ solutionsLanguage }) => Effect.succeed(matchLanguage(solutionsLanguage, dictionaryEnJson, dictionaryPlJson)),
  fetchKeypad: ({ solutionsLanguage }) => Effect.succeed(matchLanguage(solutionsLanguage, keypadEnJson, keypadPlJson)),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    Effect.gen(function* () {
      // Do not generate a riddle in the AI off mode to avoid rate limits and unnecessary token usage
      const aiSwitch = yield* readAiSwitch;
      if (aiSwitch === "off") return yield* Effect.sleep("5 seconds").pipe(Effect.as("No riddle available in the AI off mode."));
      return yield* generateRiddle(theSecretWord, solutionsLanguage);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => "Riddle unavailable. You are on your own!")
    ),

  fetchDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.succeed(Option.fromNullishOr(matchLanguage(solutionsLanguage, DEFINITIONS_EN[theSecretWord], DEFINITIONS_PL[theSecretWord]))),
});

const RpcLayer = RpcServer.layerHttp({
  group: RpcGame,
  path: "/api/rpc/game",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcGameLayer, RpcSerialization.layerJson, HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
