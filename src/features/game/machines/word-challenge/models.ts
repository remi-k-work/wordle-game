// services, features, and other libraries
import { Schema } from "effect";
import { Letter, TheSecretWord, WordScore } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type WordChallenge = typeof WordChallenge.Type;
export type Events = EventUnion<typeof Events>;

// Represents the state of the current word challenge being in progress
export const WordChallenge = Schema.Struct({
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  theSecretWord: Schema.Option(TheSecretWord),
  currentGuessWord: Schema.Trim,
  wordleGuesses: Schema.Array(TheSecretWord),
  currentTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
  startTime: Schema.Option(Schema.DateTimeUtc),
  wordScore: Schema.Option(WordScore),

  // Letters ruled out ("grey") by the submitted guesses — maintained at submit time so the per-keypress guard is an O(1) set lookup
  greyLetters: Schema.HashSet(Letter),
});

// Events are part of the machine's interface; guards receive this union as `event`
export const Events = {
  solutionsLanguageChanged: Schema.Struct({}),
  gameDataLoaded: Schema.Struct({ dictionary: WordChallenge.fields.dictionary }),
  secretWordPicked: Schema.Struct({ theSecretWord: TheSecretWord }),
  keyPressed: Schema.Struct({ pressedKey: Schema.String }),
  forfeitedRun: Schema.Struct({}),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  trackInvalidGuessSubmitted: { params: Schema.Struct({}) },
  trackValidGuessSubmitted: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  trackWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  onWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  trackWordLost: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  onWordLost: { params: Schema.Struct({}) },
};
