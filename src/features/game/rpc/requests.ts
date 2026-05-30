// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SolutionsLanguageSchema, TheSecretWordSchema } from "@/features/game/domain";

export class RpcGame extends RpcGroup.make(
  Rpc.make("fetchSolutions", {
    payload: { solutionsLanguage: SolutionsLanguageSchema },
    success: Schema.Array(TheSecretWordSchema),
  }),

  Rpc.make("fetchKeypad", {
    payload: { solutionsLanguage: SolutionsLanguageSchema },
    success: Schema.Array(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(1))),
  }),

  Rpc.make("fetchRiddle", {
    payload: { theSecretWord: TheSecretWordSchema, solutionsLanguage: SolutionsLanguageSchema },
    success: Schema.Trim.pipe(Schema.nonEmptyString()),
  }),

  Rpc.make("wordDefinition", {
    payload: { solutionsLanguage: SolutionsLanguageSchema, theSecretWord: TheSecretWordSchema },
    success: Schema.Union(Schema.Trim.pipe(Schema.nonEmptyString()), Schema.Null),
  })
) {}
