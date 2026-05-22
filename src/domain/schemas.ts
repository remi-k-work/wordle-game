// services, features, and other libraries
import { Schema } from "effect";

// schemas
export const SolutionsDataSchema = Schema.Array(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5)));
export const KeypadDataSchema = Schema.Array(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(1)));

export const RiddleRequestSchema = Schema.Struct({
  theSecretWord: Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5)),
  solutionsLanguage: Schema.Literal("En", "Pl"),
});
export const RiddleResponseSchema = Schema.Struct({ riddle: Schema.Trim });
