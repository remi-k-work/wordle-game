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
import type { SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";
import type { GameData } from "@/features/game/machines/game-data/models";

// The single place the cross-machine protocol lives: each command is an Effect
// that fans an event out to the feature machines and the global modal. Machine
// action implementations call these instead of importing every consumer's send
// atom themselves, so "what starting a run / ending a word / changing language
// means" is readable in one file and cannot drift between callers.
//
// Imported only by action implementation files (never by state modules), which
// keeps the `actions -> commands -> state -> machine -> actions` import cycle
// safe: every imported binding is touched only when a command actually runs.

// A word is requested both when a run starts and between words: close any open modal and ask game-data to pick the next word
export const requestNextWord = Effect.all(
  [Atom.set(modalMachineSendAtom, { type: "closed" }), Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" })],
  {
    discard: true,
  }
);

// A word ended (won or lost): stop the overdrive hacks and show the status modal
export const endPuzzle = Effect.all(
  [Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }), Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" })],
  { discard: true }
);

// The active run is forfeited: abandon the word challenge, stop the overdrive hacks, and show the status modal
export const forfeitRun = Effect.all(
  [
    Atom.set(wordChallengeMachineSendAtom, { type: "runForfeited" }),
    Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }),
    Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
  ],
  { discard: true }
);

// A language change abandons every in-flight feature machine and reloads the game data for the new language
export const applySolutionsLanguage = ({ solutionsLanguage }: { solutionsLanguage: SolutionsLanguage }) =>
  Effect.all(
    [
      Atom.set(runSessionMachineSendAtom, { type: "solutionsLanguageChanged" }),
      Atom.set(wordChallengeMachineSendAtom, { type: "solutionsLanguageChanged" }),
      Atom.set(overdriveHacksMachineSendAtom, { type: "solutionsLanguageChanged" }),
      Atom.set(wordMetaMachineSendAtom, { type: "resetRequested" }),
      Atom.set(gameDataMachineSendAtom, { type: "solutionsLanguageChanged", solutionsLanguage }),
    ],
    { discard: true }
  );

// A new secret word was picked: start the puzzle in the word challenge, the overdrive hacks, and the word metadata
export const publishSecretWord = ({ theSecretWord }: { theSecretWord: TheSecretWord }) =>
  Effect.all(
    [
      Atom.set(wordMetaMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
      Atom.set(wordChallengeMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
      Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleStarted" }),
    ],
    { discard: true }
  );

// The dictionary finished loading for the current language (no word yet — idle)
export const publishGameData = ({ dictionary }: { dictionary: GameData["dictionary"] }) =>
  Atom.set(wordChallengeMachineSendAtom, { type: "gameDataLoaded", dictionary });
