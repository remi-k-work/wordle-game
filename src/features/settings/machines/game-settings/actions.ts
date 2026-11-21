// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // Notify all the other machines about the solutions language change
  onSolutionsLanguageToggled: ({ solutionsLanguage }) => Atom.set(gameFlowMachineSendAtom, { type: "solutionsLanguageChanged", solutionsLanguage }),
};
