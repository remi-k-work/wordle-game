// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddHighScore, HighScore } from "@/features/high-score/domain";

export class RpcHighScore extends RpcGroup.make(
  Rpc.make("top10HighScores", {
    success: Schema.Array(HighScore),
  }),

  Rpc.make("addHighScore", {
    payload: AddHighScore,
  })
) {}
