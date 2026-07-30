// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcHighScore } from "./requests";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";

const RpcHighScoreLayer = RpcHighScore.toLayer({
  top10HighScores: (solutionsLanguage) =>
    Effect.gen(function* () {
      const highScoreDB = yield* HighScoreDB;
      return yield* highScoreDB.top10HighScores(solutionsLanguage);
    }),

  addHighScore: (payload) =>
    Effect.gen(function* () {
      const highScoreDB = yield* HighScoreDB;
      return yield* highScoreDB.addHighScore(payload);
    }),
}).pipe(Layer.provide(HighScoreDB.layer));

const RpcLayer = RpcServer.layerHttp({
  group: RpcHighScore,
  path: "/api/rpc/high-score",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcHighScoreLayer, RpcSerialization.layerJson, HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
