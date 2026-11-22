// services, features, and other libraries
import { Array, Effect, Random } from "effect";
import { Atom } from "effect/reactivity";
import { createEffectLogic } from "@xstate/effect";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { EmptySolutionsError } from "./errors";

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
export const onLoadingActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { requestedLanguage } }: EffectSourceArgs<OnLoadingInput>) {
    const solutionsLanguage = requestedLanguage ?? (yield* Atom.get(gameSettingsSolutionsLanguageAtom));

    const { fetchSolutions, fetchDictionary, fetchKeypad } = yield* RpcGameClient;
    const { solutions, dictionary, keypad } = yield* Effect.all(
      { solutions: fetchSolutions({ solutionsLanguage }), dictionary: fetchDictionary({ solutionsLanguage }), keypad: fetchKeypad({ solutionsLanguage }) },
      { concurrency: 3 }
    );

    return { solutions, dictionary, keypad } as const satisfies GameData;
  })
);

export const selectSecretWordActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { solutions } }: EffectSourceArgs<SelectSecretWordInput>) {
    // Guard explicitly so the failure is a typed, diagnosable error
    const solutionList = yield* Effect.fromOption(solutions).pipe(
      Effect.mapError(() => new EmptySolutionsError({ reason: "missing" })),
      Effect.filterOrFail(Array.isReadonlyArrayNonEmpty, () => new EmptySolutionsError({ reason: "empty" }))
    );
    return yield* Random.choice(solutionList);
  })
);
