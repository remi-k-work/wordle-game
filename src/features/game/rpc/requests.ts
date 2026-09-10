// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { GameData, SolutionsLanguage, TheSecretWord, WordMeta } from "@/features/game/domain";

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

  Rpc.make("fetchRiddleAudioBuffer", {
    payload: { input: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty())) },
    success: WordMeta.fields.theRiddleAudioBuffer,
  })
) {}
