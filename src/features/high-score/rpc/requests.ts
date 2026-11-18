// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";
import { HighScoreEntry } from "@/features/high-score/domain/models";
import { AddNewHighScore } from "@/features/high-score/machines/high-score/models";
import { SolutionsLanguage } from "@/features/game/domain/models";

export class RpcHighScore extends RpcGroup.make(
  Rpc.make("top10HighScores", {
    payload: SolutionsLanguage,
    success: Schema.Array(HighScoreEntry),
  }),

  Rpc.make("addNewHighScore", {
    payload: AddNewHighScore,
    success: Schema.Option(HighScoreEntry.fields.id),
  })
) {}
