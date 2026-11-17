// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { GameData } from "./models";
import { onLoadingActor, selectSecretWordActor } from "./actors";

export const setup = setupEffect({
  schemas: {
    context: GameData,
    events: {
      solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
      nextWordRequested: Schema.Struct({}),
      retryRequested: Schema.Struct({}),
    },
    actions: {
      onSecretWordSelected: { params: Schema.Struct({ theSecretWord: TheSecretWord }) },
      onGameDataLoaded: { params: Schema.Struct({ dictionary: Schema.Option(Schema.HashSet(TheSecretWord)) }) },
    },
  },
  actors: { onLoadingActor, selectSecretWordActor },
  actions: {
    onSecretWordSelected: ({ theSecretWord }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
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
  },
});
