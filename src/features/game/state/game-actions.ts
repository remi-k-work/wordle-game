// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { modalMachineAtom, runSessionMachineAtom, wordChallengeMachineAtom } from ".";
import { trackForfeitRunAction, trackStartNewRunAction } from "@/features/telemetry/state";

// Transition to the next word challenge while maintaining the current run streak
export const nextWordAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(modalMachineAtom, { type: "modal.closed" });
    get.set(wordChallengeMachineAtom, { type: "wordChallenge.nextWordRequested" });
  })
);

// Wipe the current session and start a completely new arcade run from scratch
export const startNewRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    // Track metrics related to the action of starting a new run
    yield* trackStartNewRunAction();

    get.set(modalMachineAtom, { type: "modal.closed" });
    get.set(runSessionMachineAtom, { type: "runSession.reset" });
    get.set(wordChallengeMachineAtom, { type: "wordChallenge.nextWordRequested" });
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    // Track metrics related to the action of forfeiting a run
    yield* trackForfeitRunAction();

    get.set(runSessionMachineAtom, { type: "runSession.finished" });
  })
);
