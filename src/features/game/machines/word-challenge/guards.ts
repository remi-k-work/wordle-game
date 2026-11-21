// services, features, and other libraries
import { Array, HashSet, Option } from "effect";
import { assertEvent } from "xstate";
import { canSubmitGuess, classifyKey } from "@/features/game/domain/validators";

// types
import type { AfterEvent } from "xstate";
import type { GuardArgs } from "@/lib/machine-setup";
import type { Events, WordChallenge } from "./models";

// constants
import { MAX_TURNS } from "@/features/game/domain/constants";
import { EMPTY_DICTIONARY } from "./constants";

type Args = GuardArgs<WordChallenge, Events>;

// Guards reached from an `after` transition also see XState's reserved after-event
type AfterArgs = GuardArgs<WordChallenge, Events | AfterEvent>;

export const guards = {
  isValidWord: ({ context }: Args) =>
    canSubmitGuess(
      context.currentGuessWord,
      context.currentTurn,
      context.wordleGuesses,
      Option.getOrElse(context.dictionary, () => EMPTY_DICTIONARY)
    ),

  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  // Only true when both the secret word and the last guess are present and equal
  isGameWon: ({ context }: AfterArgs) =>
    Option.exists(Option.all([context.theSecretWord, Array.last(context.wordleGuesses)]), ([secret, last]) => secret === last),

  // Do we have a loser? When the player runs out of turns, we have a loser
  isGameLost: ({ context }: AfterArgs) => context.currentTurn > MAX_TURNS,

  isEnterKey: ({ event }: Args) => {
    assertEvent(event, "keyPressed");
    return classifyKey(event.pressedKey).kind === "enter";
  },

  isBackspaceKey: ({ event }: Args) => {
    assertEvent(event, "keyPressed");
    return classifyKey(event.pressedKey).kind === "backspace";
  },

  isValidLetterKey: ({ context, event }: Args) => {
    assertEvent(event, "keyPressed");
    const key = classifyKey(event.pressedKey);
    if (key.kind !== "letter") return false;

    // Prevent typing letters already ruled out by genuine guesses
    return !HashSet.has(context.greyLetters, key.letter);
  },
};
