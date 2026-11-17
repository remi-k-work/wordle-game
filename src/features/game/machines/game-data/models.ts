// services, features, and other libraries
import { Schema } from "effect";
import { Keypad, TheSecretWord } from "@/features/game/domain/models";

// types
export type GameData = typeof GameData.Type;

export const GameData = Schema.Struct({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  keypad: Schema.Option(Keypad),
});
