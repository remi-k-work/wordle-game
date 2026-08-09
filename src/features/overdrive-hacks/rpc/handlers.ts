// services, features, and other libraries
import { Config, Effect, Layer, Option } from "effect";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcOverdriveHacks } from "./requests";
import { generateOverride } from "@/features/overdrive-hacks/domain/override2";

const RpcOverdriveHacksLayer = RpcOverdriveHacks.toLayer({
  fetchOverride: ({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage }) =>
    Effect.gen(function* () {
      // Do not generate an override in the AI off mode to avoid rate limits and unnecessary token usage
      const aiSwitch = yield* Config.literal("off", "AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));
      if (aiSwitch === "off") return yield* Effect.sleep("5 seconds").pipe(Effect.as(Option.some("No override available in the AI off mode.")));
      return yield* generateOverride(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage);
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.orElseSucceed(() => Option.none())
    ),
});

const RpcLayer = RpcServer.layerHttp({
  group: RpcOverdriveHacks,
  path: "/api/rpc/overdrive-hacks",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcOverdriveHacksLayer, RpcSerialization.layerJson, HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
