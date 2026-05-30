// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SolutionsLanguageSchema, TheSecretWordSchema } from "@/features/game/domain";

export class RpcGame extends RpcGroup.make(
  Rpc.make("wordDefinition", {
    payload: { solutionsLanguage: SolutionsLanguageSchema, theSecretWord: TheSecretWordSchema },
    success: Schema.Union(Schema.Trim.pipe(Schema.nonEmptyString()), Schema.Null),
  })
) {}
