// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/rpc";
import { GameData, SolutionsLanguage, TheSecretWord, WordMeta } from "@/features/game/domain/models";
import { SpeechRequest } from "@/domain/models";

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
