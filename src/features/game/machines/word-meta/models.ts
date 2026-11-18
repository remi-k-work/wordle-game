// services, features, and other libraries
import { Schema } from "effect";

// types
export type WordMeta = typeof WordMeta.Type;

export const WordMeta = Schema.Struct({
  theRiddle: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  wordDefinition: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  theRiddleAudio: Schema.Option(Schema.Uint8Array),
  wordDefinitionAudio: Schema.Option(Schema.Uint8Array),
});
