// services, features, and other libraries
import { Effect } from "effect";
import { createEffectLogic } from "@xstate/effect";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { AddNewHighScore } from "./models";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { HighScore } from "./models";

interface Top10HighScoresInput {
  solutionsLanguage: HighScore["solutionsLanguage"];
}

interface AddNewHighScoreInput {
  context: HighScore;
}

export const top10HighScoresActor = createEffectLogic(({ input: { solutionsLanguage } }: EffectSourceArgs<Top10HighScoresInput>) =>
  Effect.flatMap(RpcHighScoreClient, ({ top10HighScores }) => top10HighScores(solutionsLanguage))
);

export const addNewHighScoreActor = createEffectLogic(({ input: { context } }: EffectSourceArgs<AddNewHighScoreInput>) =>
  Effect.flatMap(RpcHighScoreClient, ({ addNewHighScore }) =>
    // Explicit field selection: the machine context carries non-wire fields (e.g. newHighScoreId) that must not ride into the request
    addNewHighScore(
      AddNewHighScore.make({ playerName: context.playerName, score: context.runScore, streak: context.streak, solutionsLang: context.solutionsLanguage })
    )
  )
);
