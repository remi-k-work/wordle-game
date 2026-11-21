// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { msg } from "gt-react";
import { toastManager } from "@/ui/toastify";
import { modalMachineSendAtom } from "@/state/modal";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  onSuccess: { params: Schema.Struct({}) },
  onNoLongerQualified: { params: Schema.Struct({}) },
  onFailure: { params: Schema.Struct({}) },
  showHighScoreModal: { params: Schema.Struct({}) },
};

export const actions = {
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
} satisfies ActionImplementations<typeof Actions>;
