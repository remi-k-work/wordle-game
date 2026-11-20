// services, features, and other libraries
import { Array, Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { createEffectLogic } from "@xstate/effect";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { wordChallengeTheSecretWordAtom, wordChallengeWordleGuessesAtom } from "@/features/game/state/word-challenge";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";
import { wordMetaTheRiddleAtom, wordMetaWordDefinitionAtom } from "@/features/game/state/word-meta";
import { calculateEmpTargets } from "@/features/overdrive-hacks/domain/emp";
import { calculateSonarTarget } from "@/features/overdrive-hacks/domain/sonar";
import { withHackPurchase } from "./helpers";
import { HackInputUnavailableError } from "./errors";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { OverdriveHacks } from "./models";

interface ApplyEmpHackInput {
  empNukedLetters: OverdriveHacks["empNukedLetters"];
}

interface ApplySonarHackInput {
  sonarReveals: OverdriveHacks["sonarReveals"];
}

interface FetchOverrideAudioInput {
  theOverride: OverdriveHacks["theOverride"];
}

// constants
import { VOWELS_BY_LANGUAGE } from "@/features/overdrive-hacks/domain/constants";

export const applyEmpHackActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { empNukedLetters } }: EffectSourceArgs<ApplyEmpHackInput>) {
    // The input reads stay inside the `produce` effect so they only run when the
    // hack is actually affordable (withHackPurchase skips `produce` otherwise)
    return yield* withHackPurchase(
      "emp",
      Effect.gen(function* () {
        const theSecretWord = yield* Effect.fromOption(
          yield* Atom.get(wordChallengeTheSecretWordAtom),
          () => new HackInputUnavailableError({ input: "theSecretWord" })
        );
        const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
        const keypad = yield* Effect.fromOption(yield* Atom.get(gameDataKeypadAtom), () => new HackInputUnavailableError({ input: "keypad" }));

        return yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, empNukedLetters);
      })
    );
  })
);

export const applySonarHackActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { sonarReveals } }: EffectSourceArgs<ApplySonarHackInput>) {
    // The input reads stay inside the `produce` effect so they only run when the
    // hack is actually affordable (withHackPurchase skips `produce` otherwise)
    return yield* withHackPurchase(
      "sonar",
      Effect.gen(function* () {
        const theSecretWord = yield* Effect.fromOption(
          yield* Atom.get(wordChallengeTheSecretWordAtom),
          () => new HackInputUnavailableError({ input: "theSecretWord" })
        );
        const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
        const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

        return yield* calculateSonarTarget(
          theSecretWord,
          wordleGuesses,
          VOWELS_BY_LANGUAGE[solutionsLanguage],
          Array.map(sonarReveals, (reveal) => reveal.vowel)
        );
      })
    );
  })
);

export const applyOverrideHackActor = createEffectLogic(
  Effect.fnUntraced(function* () {
    // The input reads stay inside the `produce` effect so they only run when the
    // hack is actually affordable (withHackPurchase skips `produce` otherwise)
    return yield* withHackPurchase(
      "override",
      Effect.gen(function* () {
        const theSecretWord = yield* Effect.fromOption(
          yield* Atom.get(wordChallengeTheSecretWordAtom),
          () => new HackInputUnavailableError({ input: "theSecretWord" })
        );
        const wordDefinition = yield* Atom.get(wordMetaWordDefinitionAtom);
        const theRiddle = yield* Atom.get(wordMetaTheRiddleAtom);
        const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
        const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

        const { fetchOverride } = yield* RpcOverdriveHacksClient;
        return yield* fetchOverride({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage });
      })
    );
  })
);

export const fetchOverrideAudioActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { theOverride } }: EffectSourceArgs<FetchOverrideAudioInput>) {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    const { fetchOverrideAudio } = yield* RpcOverdriveHacksClient;
    return yield* Option.match(theOverride, {
      onNone: () => Effect.succeedNone,
      onSome: (override) => fetchOverrideAudio({ input: override, solutionsLanguage }),
    });
  })
);
