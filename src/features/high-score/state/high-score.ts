// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { createMachineAtom } from "@/domain/machine-atom";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// The high score machine is now a living actor inside the effect atom
export const highScoreMachineAtom = createMachineAtom(highScoreMachine);

// Specialized selectors for granular state access and optimized re-renders
export const highScorePlayerNameAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.playerName));
export const highScoreRunScoreAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const highScoreStreakAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const highScoreNewHighScoreIdAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.newHighScoreId));

// Derived boolean: subscribe to this instead of the full snapshot when only
// the machine state (not context) is needed
export const highScoreIsSubmittingAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("submitting")));

// Derived boolean: the initials form is only visible while entering initials,
// submitting, or failing — a primitive result suppresses re-renders from
// unrelated context assigns (e.g. a new high-score id)
export const highScoreIsFormVisibleAtom = highScoreMachineAtom.pipe(
  Atom.map((snapshot) => snapshot.matches("enteringInitials") || snapshot.matches("submitting") || snapshot.matches("failure"))
);

// Atom to fetch the top 10 high scores (5-minute idle TTL like the chart atoms,
// so remounts within a session reuse the result instead of refetching)
export const top10HighScoresAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(Effect.flatMap(RpcHighScoreClient, ({ top10HighScores }) => top10HighScores(solutionsLanguage))).pipe(Atom.setIdleTTL("5 minutes"))
);
