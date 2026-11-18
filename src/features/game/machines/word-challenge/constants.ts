// services, features, and other libraries
import { Array, HashSet, Option, String } from "effect";

// types
import type { Letter, TheSecretWord } from "@/features/game/domain/models";
import type { WordChallenge } from "./models";

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_WORD_CHALLENGE = () =>
  ({
    dictionary: Option.none(),
    theSecretWord: Option.none(),
    currentGuessWord: String.empty,
    wordleGuesses: Array.empty<TheSecretWord>(),
    currentTurn: 1,
    startTime: Option.none(),
    wordScore: Option.none(),
    greyLetters: HashSet.empty<Letter>(),
  }) as const satisfies WordChallenge;

// Shared empty dictionary reused for the no-guesses-yet case, so the per-keypress
// `isValidWord` guard doesn't allocate a fresh HashSet on every keystroke
export const EMPTY_DICTIONARY = HashSet.empty<string>();
