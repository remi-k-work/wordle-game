// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { GameData, SolutionsLanguage, TheSecretWord, WordMeta } from "@/features/game/domain";
import { SpeechRequest } from "@/domain";

export class RpcGame extends RpcGroup.make(
  Rpc.make("fetchSolutions", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: GameData.fields.solutions,
  }),

  Rpc.make("fetchDictionary", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: GameData.fields.dictionary,
  }),

  Rpc.make("fetchKeypad", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: GameData.fields.keypad,
  }),

  Rpc.make("fetchRiddle", {
    payload: { theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage },
    success: WordMeta.fields.theRiddle,
  }),

  Rpc.make("fetchDefinition", {
    payload: { solutionsLanguage: SolutionsLanguage, theSecretWord: TheSecretWord },
    success: WordMeta.fields.wordDefinition,
  }),

  Rpc.make("fetchRiddleAudio", {
    payload: { input: SpeechRequest.fields.input, solutionsLanguage: SolutionsLanguage },
    success: WordMeta.fields.theRiddleAudio,
  }),

  Rpc.make("fetchWordDefinitionAudio", {
    payload: { input: SpeechRequest.fields.input, solutionsLanguage: SolutionsLanguage },
    success: WordMeta.fields.wordDefinitionAudio,
  })
) {}
