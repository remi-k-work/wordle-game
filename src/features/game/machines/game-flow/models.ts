// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage, WordScore } from "@/features/game/domain/models";
import { WordChallenge } from "@/features/game/machines/word-challenge/models";

// types
import type { EventUnion } from "@/lib/machine-setup";

// The machine only ever carries one flag: whether a persisted run session was active when the flow started
export const GameFlow = Schema.Struct({ hasActiveRun: Schema.Boolean });

// Events are part of the machine's interface
export const Events = {
  "run.startRequested": Schema.Struct({}),
  "word.nextRequested": Schema.Struct({}),
  "run.forfeitConfirmed": Schema.Struct({ wordChallenge: WordChallenge }),
  "word.won": Schema.Struct({ wordScore: WordScore }),
  "word.lost": Schema.Struct({}),
  "language.changed": Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
};

export type Events = EventUnion<typeof Events>;
