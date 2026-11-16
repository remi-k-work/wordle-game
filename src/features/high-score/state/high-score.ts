// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { createMachineState } from "@/lib/machine-atoms";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

const highScoreMachineBag = createActorAtoms(RuntimeAtom, highScoreMachine);
export const { snapshot: highScoreMachineAtom, send: highScoreMachineSendAtom } = createMachineState(highScoreMachine, highScoreMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const highScoreNewHighScoreIdAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.newHighScoreId));

// Derived boolean: subscribe to this instead of the full snapshot when only the machine state (not context) is needed
export const highScoreIsSubmittingAtom = highScoreMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("submitting")));

// Derived boolean: the initials form is only visible while entering initials, submitting, or failing
export const highScoreIsFormVisibleAtom = highScoreMachineAtom.pipe(
  Atom.map((snapshot) => snapshot.matches("enteringInitials") || snapshot.matches("submitting") || snapshot.matches("failure"))
);

// Atom to fetch the top 10 high scores (5-minute idle TTL like the chart atoms, so remounts within a session reuse the result instead of refetching)
export const top10HighScoresAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(Effect.flatMap(RpcHighScoreClient, ({ top10HighScores }) => top10HighScores(solutionsLanguage))).pipe(Atom.setIdleTTL("5 minutes"))
);
