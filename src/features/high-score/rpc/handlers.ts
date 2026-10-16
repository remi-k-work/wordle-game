import "server-only";

// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcHighScore } from "./requests";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { makeRpcHandler } from "@/domain/helpers";

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

export const handler = makeRpcHandler(RpcHighScore, "/api/rpc/high-score", RpcHighScoreLayer);
