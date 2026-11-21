// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { modalMachineSendAtom } from "@/state/modal";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  forwardKeyPress: { params: Schema.Struct({ pressedKey: Schema.String }) },
  onOverrideHackApplied: { params: Schema.Struct({}) },
  logHackFailure: { params: Schema.Struct({ hackId: Schema.String, error: Schema.Unknown }) },
};

export const actions = {
  forwardKeyPress: ({ pressedKey }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
    Atom.set(wordChallengeMachineSendAtom, { type: "keyPressed", pressedKey }),

  // A failed override still opens the modal, which has its own "unavailable" state
  onOverrideHackApplied: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
    Atom.set(modalMachineSendAtom, { type: "opened", modalType: "override-hack" }),

  logHackFailure: ({ hackId, error }) => Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, error),
} satisfies ActionImplementations<typeof Actions>;
