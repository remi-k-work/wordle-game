// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/rpc";
import { SolutionsLanguage, TheSecretWord, WordChallenge, WordMeta } from "@/features/game/domain/models";
import { OverdriveHacks } from "@/features/overdrive-hacks/domain/models";
import { SpeechRequest } from "@/domain/models";

// The HTTP path this group is mounted on, shared by the server handler and the
// client so the two cannot drift apart. The route file keeps a literal:
// TanStack's router plugin statically crawls route files and rejects a variable
// route id
export const RPC_OVERDRIVE_HACKS_PATH = "/api/rpc/overdrive-hacks";

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
