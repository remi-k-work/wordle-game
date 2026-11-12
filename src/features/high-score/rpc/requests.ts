// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";
import { AddHighScore, HighScore } from "@/features/high-score/domain/models";
import { SolutionsLanguage } from "@/features/game/domain/models";

// The HTTP path this group is mounted on, shared by the server handler and the
// client so the two cannot drift apart. The route file keeps a literal:
// TanStack's router plugin statically crawls route files and rejects a variable
// route id
export const RPC_HIGH_SCORE_PATH = "/api/rpc/high-score";

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
