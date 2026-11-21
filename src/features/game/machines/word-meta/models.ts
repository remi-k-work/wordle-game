// services, features, and other libraries
import { Schema } from "effect";
import { TheSecretWord } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";

export type WordMeta = typeof WordMeta.Type;

export const WordMeta = Schema.Struct({
  theRiddle: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  wordDefinition: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  theRiddleAudio: Schema.Option(Schema.Uint8Array),
  wordDefinitionAudio: Schema.Option(Schema.Uint8Array),
});

// Events are part of the machine's interface
export const Events = {
  secretWordPicked: Schema.Struct({ theSecretWord: TheSecretWord }),
  resetRequested: Schema.Struct({}),
};

export type Events = EventUnion<typeof Events>;
