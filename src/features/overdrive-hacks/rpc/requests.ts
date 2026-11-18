// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/rpc";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";
import { WordMeta } from "@/features/game/machines/word-meta/models";
import { WordChallenge } from "@/features/game/machines/word-challenge/models";
import { OverdriveHacks } from "@/features/overdrive-hacks/domain/models";
import { SpeechRequest } from "@/domain/models";

// Payload shapes reused by several RPCs
const AudioPayload = { input: SpeechRequest.fields.input, solutionsLanguage: SolutionsLanguage };

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
    payload: AudioPayload,
    success: OverdriveHacks.fields.theOverrideAudio,
  })
) {}
