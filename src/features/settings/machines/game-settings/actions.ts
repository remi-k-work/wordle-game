// services, features, and other libraries
import { applySolutionsLanguage } from "@/features/game/state/commands";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // The language-change fan-out lives in state/commands alongside the other
  // cross-machine protocols
  onSolutionsLanguageToggled: ({ solutionsLanguage }) => applySolutionsLanguage({ solutionsLanguage }),
};
