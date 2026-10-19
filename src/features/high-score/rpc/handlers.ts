import "server-only";

// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcHighScore } from "./requests";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { PgLive } from "@/lib/pg-live";
import { makeRpcHandler } from "@/domain/helpers";

// Every handler is a pass-through to the same DB service method, so the
// service lookup is hoisted once and the handlers delegate point-free
const highScoreDB = Effect.service(HighScoreDB);

const RpcHighScoreLayer = RpcHighScore.toLayer({
  top10HighScores: (solutionsLanguage) => Effect.flatMap(highScoreDB, (db) => db.top10HighScores(solutionsLanguage)),

  addHighScore: (payload) => Effect.flatMap(highScoreDB, (db) => db.addHighScore(payload)),
}).pipe(Layer.provide(HighScoreDB.layer), Layer.provide(PgLive));

export const handler = makeRpcHandler(RpcHighScore, "/api/rpc/high-score", RpcHighScoreLayer);
