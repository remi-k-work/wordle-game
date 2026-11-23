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
import { requireHackInput } from "./helpers";

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
    const theSecretWord = yield* requireHackInput(wordChallengeTheSecretWordAtom, "theSecretWord");
    const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
    const keypad = yield* requireHackInput(gameDataKeypadAtom, "keypad");

    return yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, empNukedLetters);
  })
);

export const applySonarHackActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { sonarReveals } }: EffectSourceArgs<ApplySonarHackInput>) {
    const theSecretWord = yield* requireHackInput(wordChallengeTheSecretWordAtom, "theSecretWord");
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

export const applyOverrideHackActor = createEffectLogic(
  Effect.fnUntraced(function* () {
    const theSecretWord = yield* requireHackInput(wordChallengeTheSecretWordAtom, "theSecretWord");
    const wordDefinition = yield* Atom.get(wordMetaWordDefinitionAtom);
    const theRiddle = yield* Atom.get(wordMetaTheRiddleAtom);
    const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    const { fetchOverride } = yield* RpcOverdriveHacksClient;
    return yield* fetchOverride({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage });
  })
);

export const fetchOverrideAudioActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { theOverride } }: EffectSourceArgs<FetchOverrideAudioInput>) {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    return yield* Option.match(theOverride, {
      onNone: () => Effect.succeedNone,
      onSome: (input) => Effect.flatMap(RpcOverdriveHacksClient, ({ fetchOverrideAudio }) => fetchOverrideAudio({ input, solutionsLanguage })),
    });
  })
);
