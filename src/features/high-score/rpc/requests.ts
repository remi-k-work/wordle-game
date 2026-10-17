// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddHighScore, HighScore } from "@/features/high-score/domain/models";
import { SolutionsLanguage } from "@/features/game/domain/models";

export class RpcHighScore extends RpcGroup.make(
  Rpc.make("top10HighScores", {
    payload: SolutionsLanguage,
    success: Schema.Array(HighScore),
  }),

  Rpc.make("addHighScore", {
    payload: AddHighScore,
    success: Schema.Option(HighScore.fields.id),
  })
) {}
