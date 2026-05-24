// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "@effect/rpc";
import { AddHighScoreSchema, HighScoreSchema } from "@/domain";

export class RpcHighScore extends RpcGroup.make(
  Rpc.make("top10HighScores", {
    success: Schema.Array(HighScoreSchema),
  }),

  Rpc.make("addHighScore", {
    payload: AddHighScoreSchema,
    success: Schema.Void,
  })
) {}
