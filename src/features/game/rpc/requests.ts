// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { Keypad, SolutionsLanguage, TheRiddle, TheSecretWord, WordDefinition } from "@/features/game/domain";

export class RpcGame extends RpcGroup.make(
  Rpc.make("fetchSolutions", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: Schema.Array(TheSecretWord),
  }),

  Rpc.make("fetchDictionary", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: Schema.Array(TheSecretWord),
  }),

  Rpc.make("fetchKeypad", {
    payload: { solutionsLanguage: SolutionsLanguage },
    success: Keypad,
  }),

  Rpc.make("fetchRiddle", {
    payload: { theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage },
    success: TheRiddle,
  }),

  Rpc.make("fetchDefinition", {
    payload: { solutionsLanguage: SolutionsLanguage, theSecretWord: TheSecretWord },
    success: WordDefinition,
  })
) {}
