// services, features, and other libraries
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";

// types
import type { DoneActorEvent } from "xstate";
import type { GuardArgs } from "@/lib/machine-setup";
import type { HighScoreEntry } from "@/features/high-score/domain/models";
import type { Events, HighScore } from "./models";

// The guard runs in `onDone`, so it also sees the actor's reserved done-event
type Args = GuardArgs<HighScore, Events | DoneActorEvent<ReadonlyArray<HighScoreEntry>>>;

export const guards = {
  // Determine if the current run qualifies for the high score
  qualifiesForHighScore: ({ context }: Args, params: { top10HighScores: ReadonlyArray<HighScoreEntry> }) =>
    // Fewer than 10 entries means any score qualifies; otherwise it must beat
    // the 10th-place entry (shared with the DB service's post-lock re-check)
    qualifiesForTop10(params.top10HighScores, context.runScore, context.streak),
};
