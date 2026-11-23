// services, features, and other libraries
import { Schema } from "effect";
import { Keypad, SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type GameData = typeof GameData.Type;
export type Events = EventUnion<typeof Events>;
export type GameDataOperation = typeof GameDataOperation.Type;
export type GameDataFailure = typeof GameDataFailure.Type;

export const GameData = Schema.Struct({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  keypad: Schema.Option(Keypad),
});

// The two operations that can fail or time out, and therefore the two retry targets
export const GameDataOperation = Schema.Literals(["loading", "selectingWord"]);

// State input for the `failure` state: which operation failed, so a retry can re-enter exactly that one; removed when the state exits
export const GameDataFailure = Schema.Struct({ operation: GameDataOperation });

// Events are part of the machine's interface
export const Events = {
  solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
  nextWordRequested: Schema.Struct({}),
  retryRequested: Schema.Struct({}),
};

// Action params are part of the machine's interface; implementations receive exactly these params (plus `self`)
export const Actions = {
  onSecretWordSelected: { params: Schema.Struct({ theSecretWord: TheSecretWord }) },
  onGameDataLoaded: { params: Schema.Struct({ dictionary: Schema.Option(Schema.HashSet(TheSecretWord)) }) },
  onGameDataFailed: { params: Schema.Struct({ operation: GameDataOperation, error: Schema.Unknown }) },
};
