// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { modalMachineSendAtom } from "@/state/modal";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  forwardKeyPress: ({ pressedKey }) => Atom.set(wordChallengeMachineSendAtom, { type: "keyPressed", pressedKey }),

  // A failed override still opens the modal, which has its own "unavailable" state
  onOverrideHackApplied: () => Atom.set(modalMachineSendAtom, { type: "opened", modalType: "override-hack" }),

  logHackFailure: ({ hackId, error }) => Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, error),
};
