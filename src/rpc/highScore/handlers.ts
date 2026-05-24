// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { HttpServer } from "@effect/platform";
import { RpcHighScore } from "./requests";
import { HighScoreDB } from "@/services";

const RpcHighScoreLayer = RpcHighScore.toLayer({
  top10HighScores: () =>
    Effect.gen(function* () {
      const highScoreDB = yield* HighScoreDB;
      return yield* highScoreDB.top10HighScores;
    }),

  addHighScore: (payload) =>
    Effect.gen(function* () {
      const highScoreDB = yield* HighScoreDB;
      yield* highScoreDB.addHighScore(payload);
    }),
}).pipe(Layer.provide(HighScoreDB.Default));

export const { dispose, handler } = RpcServer.toWebHandler(RpcHighScore, {
  layer: Layer.mergeAll(RpcHighScoreLayer, RpcSerialization.layerNdjson, HttpServer.layerContext),
});
