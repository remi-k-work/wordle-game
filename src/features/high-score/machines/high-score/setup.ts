// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { msg } from "gt-react";
import { toastManager } from "@/ui/toastify";
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";
import { modalMachineSendAtom } from "@/state/modal";
import { HighScore } from "./models";
import { top10HighScoresActor, addNewHighScoreActor } from "./actors";

// types
import type { HighScoreEntry } from "@/features/high-score/domain/models";

export const setup = setupEffect({
  schemas: {
    context: HighScore,
    events: {
      runFinished: Schema.Struct({
        runScore: HighScore.fields.runScore,
        streak: HighScore.fields.streak,
        solutionsLanguage: HighScore.fields.solutionsLanguage,
      }),
      initialsSubmitted: Schema.Struct({ playerName: HighScore.fields.playerName }),
    },
    actions: {
      onSuccess: { params: Schema.Struct({}) },
      onNoLongerQualified: { params: Schema.Struct({}) },
      onFailure: { params: Schema.Struct({}) },
      showHighScoreModal: { params: Schema.Struct({}) },
    },
  },
  guards: {
    // Determine if the current run qualifies for the high score
    qualifiesForHighScore: ({ context }, params: { top10HighScores: ReadonlyArray<HighScoreEntry> }) =>
      // Fewer than 10 entries means any score qualifies; otherwise it must beat
      // the 10th-place entry (shared with the DB service's post-lock re-check)
      qualifiesForTop10(params.top10HighScores, context.runScore, context.streak),
  },
  actors: { top10HighScoresActor, addNewHighScoreActor },
  delays: { delay: 3000 },
  actions: {
    onSuccess: () =>
      Effect.sync(() => {
        toastManager.add({ title: msg("Score Recorded"), description: msg("Good luck on your next run!") });
      }),

    onNoLongerQualified: () =>
      Effect.sync(() => {
        toastManager.add({ type: "error", title: msg("Leaderboard Updated"), description: msg("This score no longer qualifies for the Top 10.") });
      }),

    onFailure: () =>
      Effect.sync(() => {
        toastManager.add({ type: "error", title: msg("Submission Failed"), description: msg("Failed to save your score. Please try again later.") });
      }),

    showHighScoreModal: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(modalMachineSendAtom, { type: "opened", modalType: "high-score" }),
  },
});
