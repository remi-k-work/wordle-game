// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// Confirming a forfeit is a synchronous hop between two atoms, so it is a write
// atom rather than an Effect: *what* dropping the run does — read the challenge
// in flight, then hand the flow machine the event that fans the reset out —
// belongs with the other run-flow rules in this feature.
// The read stays inside the write on purpose: the challenge the flow machine
// receives is the one that was in flight when the dialog was confirmed, not
// whatever the alert's last render happened to capture. Going through the atom
// registry also means no Effect runtime is needed for an atom-to-atom hop.
// The read value is unused (`null`); only the setter matters
export const confirmForfeitRunAtom = Atom.writable<null, void>(
  () => null,
  (ctx) => {
    const wordChallenge = ctx.get(wordChallengeMachineAtom).context;
    ctx.set(gameFlowMachineSendAtom, { type: "run.forfeitConfirmed", wordChallenge });
  }
);
