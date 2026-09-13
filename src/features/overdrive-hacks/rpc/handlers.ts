// services, features, and other libraries
import { Array, Effect, Layer, Option, Random } from "effect";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { NodeHttpClient } from "@effect/platform-node";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcOverdriveHacks } from "./requests";
import { generateOverride } from "@/features/overdrive-hacks/domain";
import { OpenRouterClientLayer } from "@/domain";
import { readAiSwitch } from "@/lib/rpc";
import { matchLanguage } from "@/features/game/domain";
import { OpenRouter } from "@/services/open-router";

// constants
import { VOICES_PL } from "@/domain";

const RpcOverdriveHacksLayer = RpcOverdriveHacks.toLayer({
  fetchOverride: ({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage }) =>
    Effect.gen(function* () {
      // Do not generate an override in the AI off mode to avoid rate limits and unnecessary token usage
      const aiSwitch = yield* readAiSwitch;
      if (aiSwitch === "off") return yield* Effect.succeedSome("No override available in the AI off mode.");
      return yield* generateOverride(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),

  fetchOverrideAudio: ({ input, solutionsLanguage }) =>
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
const RpcOverdriveHacksLayerWithOpenRouter = RpcOverdriveHacksLayer.pipe(Layer.provide(OpenRouterClientWithHttp), Layer.provide(OpenRouter.layer));

const RpcLayer = RpcServer.layerHttp({
  group: RpcOverdriveHacks,
  path: "/api/rpc/overdrive-hacks",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcOverdriveHacksLayerWithOpenRouter, RpcSerialization.layerSchemaBinary(), HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
