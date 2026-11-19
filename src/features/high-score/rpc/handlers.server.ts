// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcHighScore } from "./requests";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { PgLive } from "@/lib/pg.server";
import { makeRpcHandler } from "@/domain/helpers.server";

// constants
import { RPC_HIGH_SCORE_PATH } from "@/domain/constants";

// Every handler is a pass-through to the same DB service method
const RpcHighScoreLayer = RpcHighScore.toLayer({
  top10HighScores: (solutionsLanguage) => Effect.flatMap(HighScoreDB, (db) => db.top10HighScores(solutionsLanguage)),
  addNewHighScore: (payload) => Effect.flatMap(HighScoreDB, (db) => db.addNewHighScore(payload)),
}).pipe(Layer.provide(HighScoreDB.layer), Layer.provide(PgLive));

export const handler = makeRpcHandler(RpcHighScore, RPC_HIGH_SCORE_PATH, RpcHighScoreLayer);
