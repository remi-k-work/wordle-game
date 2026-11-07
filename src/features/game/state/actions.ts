// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// Confirming a forfeit, as one named Effect rather than an inline `Effect.gen`
// inside the alert's `onOkayed`: the alert only says that the run is being
// dropped, while *what* dropping it does — read the challenge in flight, then
// hand the flow machine the event that fans the reset out — belongs with the
// other run-flow rules in this feature
// The read-then-write stays inside one Effect on purpose: the challenge the
// flow machine receives is the one that was in flight when the dialog was
// confirmed, not whatever a later render would have read
export const confirmForfeitRun = Effect.gen(function* () {
  const wordChallenge = (yield* Atom.get(wordChallengeMachineAtom)).context;
  yield* Atom.set(gameFlowMachineAtom, { type: "run.forfeitConfirmed", wordChallenge });
});
