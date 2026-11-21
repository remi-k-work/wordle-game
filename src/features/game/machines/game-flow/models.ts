// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage, WordScore } from "@/features/game/domain/models";
import { WordChallenge } from "@/features/game/machines/word-challenge/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type Events = EventUnion<typeof Events>;

// The machine only ever carries one flag: whether a persisted run session was active when the flow started
export const GameFlow = Schema.Struct({ hasActiveRun: Schema.Boolean });

// Events are part of the machine's interface
export const Events = {
  newRunStarted: Schema.Struct({}),
  nextWordRequested: Schema.Struct({}),
  runForfeited: Schema.Struct({ wordChallenge: WordChallenge }),
  wordWon: Schema.Struct({ wordScore: WordScore }),
  wordLost: Schema.Struct({}),
  solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  startNewRun: { params: Schema.Struct({}) },
  requestNextWord: { params: Schema.Struct({}) },
  forfeitRun: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  bankWonWord: { params: Schema.Struct({ wordScore: WordScore }) },
  finishLostRun: { params: Schema.Struct({}) },
  changeLanguage: { params: Schema.Struct({ solutionsLanguage: SolutionsLanguage }) },
};
