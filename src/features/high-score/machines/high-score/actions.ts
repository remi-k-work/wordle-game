// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { msg } from "gt-react";
import { toastManager } from "@/ui/toastify";
import { modalMachineSendAtom } from "@/state/modal";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
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

  showHighScoreModal: () => Atom.set(modalMachineSendAtom, { type: "opened", modalType: "high-score" }),
};
