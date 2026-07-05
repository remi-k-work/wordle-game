// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { Keypad, SolutionsLanguage, TheSecretWord } from "@/features/game/domain";

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
    success: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty())),
  }),

  Rpc.make("wordDefinition", {
    payload: { solutionsLanguage: SolutionsLanguage, theSecretWord: TheSecretWord },
    success: Schema.Union([Schema.Trim.pipe(Schema.check(Schema.isNonEmpty())), Schema.Null]),
  })
) {}
