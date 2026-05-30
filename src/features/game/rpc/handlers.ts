// services, features, and other libraries
import { Effect, Layer, Option } from "effect";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { HttpServer } from "@effect/platform";
import { RpcGame } from "./requests";

// assets
import definitionsEnJson from "@/assets/definitions-en.json";
import definitionsPlJson from "@/assets/definitions-pl.json";

// constants
const DEFINITIONS_EN = definitionsEnJson as Record<string, string | null>;
const DEFINITIONS_PL = definitionsPlJson as Record<string, string | null>;

const RpcGameLayer = RpcGame.toLayer({
  wordDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.gen(function* () {
      return Option.fromNullable(solutionsLanguage === "En" ? DEFINITIONS_EN[theSecretWord] : DEFINITIONS_PL[theSecretWord]).pipe(Option.getOrNull);
    }),
});

export const { dispose, handler } = RpcServer.toWebHandler(RpcGame, {
  layer: Layer.mergeAll(RpcGameLayer, RpcSerialization.layerNdjson, HttpServer.layerContext),
});
