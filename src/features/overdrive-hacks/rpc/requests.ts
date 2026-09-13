// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { SolutionsLanguage, TheSecretWord, WordChallenge, WordMeta } from "@/features/game/domain";
import { OverdriveHacks } from "@/features/overdrive-hacks/domain";
import { SpeechRequest } from "@/domain";

export class RpcOverdriveHacks extends RpcGroup.make(
  Rpc.make("fetchOverride", {
    payload: {
      theSecretWord: TheSecretWord,
      wordDefinition: WordMeta.fields.wordDefinition,
      theRiddle: WordMeta.fields.theRiddle,
      wordleGuesses: WordChallenge.fields.wordleGuesses,
      solutionsLanguage: SolutionsLanguage,
    },
    success: OverdriveHacks.fields.theOverride,
  }),

  Rpc.make("fetchOverrideAudio", {
    payload: { input: SpeechRequest.fields.input, solutionsLanguage: SolutionsLanguage },
    success: OverdriveHacks.fields.theOverrideAudio,
  })
) {}
