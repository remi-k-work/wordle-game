// services, features, and other libraries
import { Effect } from "effect";
import { publishGameData, publishSecretWord } from "@/features/game/state/commands";

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

        publishSecretWord({ theSecretWord }),
      ],
      { discard: true }
    ),

  // Notify the word challenge machine that game data is ready (no word yet — idle state)
  onGameDataLoaded: ({ dictionary }) => publishGameData({ dictionary }),

  // Log which operation failed and why; the operation travels with the failure state's input, so a retry can target exactly that operation
  onGameDataFailed: ({ operation, error }) => Effect.logError(`[GAME DATA FAILED]: ${operation}`, error),
};
