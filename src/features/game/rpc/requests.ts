// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/rpc";
import { GameData, SolutionsLanguage, TheSecretWord, WordMeta } from "@/features/game/domain/models";
import { SpeechRequest } from "@/domain/models";

// The HTTP path this group is mounted on, shared by the server handler and the
// client so the two cannot drift apart. The route file (routes/api.rpc.game.ts)
// keeps a literal: TanStack's router plugin statically crawls route files and
// rejects a variable route id
export const RPC_GAME_PATH = "/api/rpc/game";

// Payload shapes reused by several RPCs
const SolutionsLanguagePayload = { solutionsLanguage: SolutionsLanguage };
const SecretWordPayload = { theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage };
const AudioPayload = { input: SpeechRequest.fields.input, solutionsLanguage: SolutionsLanguage };

export class RpcGame extends RpcGroup.make(
  Rpc.make("fetchSolutions", {
    payload: SolutionsLanguagePayload,
    success: GameData.fields.solutions,
  }),

  Rpc.make("fetchDictionary", {
    payload: SolutionsLanguagePayload,
    success: GameData.fields.dictionary,
  }),

  Rpc.make("fetchKeypad", {
    payload: SolutionsLanguagePayload,
    success: GameData.fields.keypad,
  }),

  Rpc.make("fetchRiddle", {
    payload: SecretWordPayload,
    success: WordMeta.fields.theRiddle,
  }),

  Rpc.make("fetchDefinition", {
    payload: SecretWordPayload,
    success: WordMeta.fields.wordDefinition,
  }),

  Rpc.make("fetchRiddleAudio", {
    payload: AudioPayload,
    success: WordMeta.fields.theRiddleAudio,
  }),

  Rpc.make("fetchWordDefinitionAudio", {
    payload: AudioPayload,
    success: WordMeta.fields.wordDefinitionAudio,
  })
) {}
