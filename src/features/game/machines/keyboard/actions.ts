// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  forwardKeyPress: ({ pressedKey }) => Atom.set(wordChallengeMachineSendAtom, { type: "keyPressed", pressedKey }),
};
