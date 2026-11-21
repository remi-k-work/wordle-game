// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  onSecretWordSelected: ({ theSecretWord }) =>
    Effect.all(
      [
        // *** TEST CODE ***
        // *** TEST CODE ***
        // *** TEST CODE ***
        Effect.log(`The Secret Word: ${theSecretWord}`),
        // *** TEST CODE ***
        // *** TEST CODE ***
        // *** TEST CODE ***

        Atom.set(wordMetaMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
        Atom.set(wordChallengeMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzle.started" }),
      ],
      { discard: true }
    ),

  // Notify the word challenge machine that game data is ready (no word yet — idle state)
  onGameDataLoaded: ({ dictionary }) => Atom.set(wordChallengeMachineSendAtom, { type: "gameDataLoaded", dictionary }),
};
