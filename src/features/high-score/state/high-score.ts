// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { createMachineAtom } from "@/lib/machine-atom";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

// The high score machine is now a living actor inside the effect atom
export const highScoreMachineAtom = createMachineAtom(highScoreMachine);

// Specialized selectors for granular state access and optimized re-renders
export const highScorePlayerNameAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.playerName));
export const highScoreRunScoreAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.runScore));
export const highScoreStreakAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.streak));
export const highScoreSolutionsLanguageAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const highScoreNewHighScoreIdAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.newHighScoreId));

// Atom to fetch the top 10 high scores
export const top10HighScoresAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.gen(function* () {
      const { top10HighScores } = yield* RpcHighScoreClient;
      return yield* top10HighScores(solutionsLanguage);
    })
  )
);
