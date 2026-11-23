// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { keyboardMachineSendAtom } from "@/features/game/state/keyboard";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { modalMachineSendAtom } from "@/state/modal";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

export const actions: ActionImplementations<typeof Actions> = {
  // The keyboard machine owns key filtering; the overdrive hacks only tell it which letters are currently nuked
  syncBlockedLetters: ({ blockedLetters }) => Atom.set(keyboardMachineSendAtom, { type: "blockedLettersChanged", blockedLetters }),

  // Charging the run score is the machine's consequence of a produced hack result; the actors only compute
  chargeHack: ({ overdriveHackId }) => Atom.set(runSessionMachineSendAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST(overdriveHackId) }),

  // A failed override still opens the modal, which has its own "unavailable" state
  onOverrideHackApplied: () => Atom.set(modalMachineSendAtom, { type: "opened", modalType: "override-hack" }),

  logHackFailure: ({ hackId, error }) => Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, error),
};
