// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { modalMachineSendAtom } from "@/state/modal";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { gameDataMachineSendAtom } from "@/features/game/state/game-data";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // Start a brand-new run: close the modal, start the run session, pick the first word
  startNewRun: () =>
    Effect.all(
      [
        Atom.set(modalMachineSendAtom, { type: "closed" }),
        Atom.set(runSessionMachineSendAtom, { type: "newRunStarted" }),
        Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" }),
      ],
      { discard: true }
    ),

  // Between words: close the modal and ask game-data for the next word
  requestNextWord: () =>
    Effect.all([Atom.set(modalMachineSendAtom, { type: "closed" }), Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" })], { discard: true }),

  // Forfeit the active run: abandon the run session + word challenge, stop the overdrive hacks, and open the status modal
  forfeitRun: ({ wordChallenge }) =>
    Effect.all(
      [
        Atom.set(runSessionMachineSendAtom, { type: "runForfeited", wordChallenge }),
        Atom.set(wordChallengeMachineSendAtom, { type: "runForfeited" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ],
      { discard: true }
    ),

  // Bank the won word into the run session, stop the hacks, show the status modal
  bankWonWord: ({ wordScore }) =>
    Effect.all(
      [
        Atom.set(runSessionMachineSendAtom, { type: "wordWon", wordScore }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ],
      { discard: true }
    ),

  // The run died on guesses: finish it, stop the hacks, show the status modal
  finishLostRun: () =>
    Effect.all(
      [
        Atom.set(runSessionMachineSendAtom, { type: "wordLost" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ],
      { discard: true }
    ),

  // Language change abandons every in-flight feature machine and reloads the game data for the new language
  changeLanguage: ({ solutionsLanguage }) =>
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
