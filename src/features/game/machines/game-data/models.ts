// services, features, and other libraries
import { Schema } from "effect";
import { Keypad, SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type GameData = typeof GameData.Type;
export type Events = EventUnion<typeof Events>;

export const GameData = Schema.Struct({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  keypad: Schema.Option(Keypad),
});

// Events are part of the machine's interface
export const Events = {
  solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
  nextWordRequested: Schema.Struct({}),
  retryRequested: Schema.Struct({}),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  onSecretWordSelected: { params: Schema.Struct({ theSecretWord: TheSecretWord }) },
  onGameDataLoaded: { params: Schema.Struct({ dictionary: Schema.Option(Schema.HashSet(TheSecretWord)) }) },
};
