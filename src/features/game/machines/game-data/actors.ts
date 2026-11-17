// services, features, and other libraries
import { Effect, Random } from "effect";
import { Atom } from "effect/reactivity";
import { createEffectLogic } from "@xstate/effect";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { GameData } from "./models";

interface OnLoadingInput {
  requestedLanguage?: SolutionsLanguage;
}

interface SelectSecretWordInput {
  solutions: GameData["solutions"];
}

// Load the needed game data and create the dictionary of valid words
export const onLoadingActor = createEffectLogic(({ input: { requestedLanguage } }: EffectSourceArgs<OnLoadingInput>) =>
  Effect.gen(function* () {
    const solutionsLanguage = requestedLanguage ?? (yield* Atom.get(gameSettingsSolutionsLanguageAtom));

    const { fetchSolutions, fetchDictionary, fetchKeypad } = yield* RpcGameClient;
    const { solutions, dictionary, keypad } = yield* Effect.all(
      { solutions: fetchSolutions({ solutionsLanguage }), dictionary: fetchDictionary({ solutionsLanguage }), keypad: fetchKeypad({ solutionsLanguage }) },
      { concurrency: 3 }
    );

    return { solutions, dictionary, keypad } as const satisfies GameData;
  })
);

export const selectSecretWordActor = createEffectLogic(({ input: { solutions } }: EffectSourceArgs<SelectSecretWordInput>) =>
  Effect.flatMap(Effect.fromOption(solutions), Random.choice)
);
