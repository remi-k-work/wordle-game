// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { gameDataMachineSendAtom } from "@/features/game/state/game-data";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // A language change abandons every in-flight feature machine and reloads the
  // game data for the new language (the settings machine owns the toggle, so it
  // owns the fan-out)
  onSolutionsLanguageToggled: ({ solutionsLanguage }) =>
    Effect.all(
      [
        Atom.set(runSessionMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(wordChallengeMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(wordMetaMachineSendAtom, { type: "resetRequested" }),
        Atom.set(gameDataMachineSendAtom, { type: "solutionsLanguageChanged", solutionsLanguage }),
      ],
      { discard: true }
    ),
};
