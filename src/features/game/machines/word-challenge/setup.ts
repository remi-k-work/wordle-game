// services, features, and other libraries
import { Array, Effect, HashSet, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { TheSecretWord } from "@/features/game/domain/models";
import { canSubmitGuess, classifyKey } from "@/features/game/domain/validators";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state/actions";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { WordChallenge } from "./models";

// constants
import { MAX_TURNS } from "@/features/game/domain/constants";
import { EMPTY_DICTIONARY } from "./constants";

export const setup = setupEffect({
  schemas: {
    context: WordChallenge,
    events: {
      solutionsLanguageChanged: Schema.Struct({}),
      gameDataLoaded: Schema.Struct({ dictionary: WordChallenge.fields.dictionary }),
      secretWordPicked: Schema.Struct({ theSecretWord: TheSecretWord }),
      keyPressed: Schema.Struct({ pressedKey: Schema.String }),
      forfeitedRun: Schema.Struct({}),
    },
    actions: {
      trackInvalidGuessSubmitted: { params: Schema.Struct({}) },
      trackValidGuessSubmitted: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
      trackWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
      onWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
      trackWordLost: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
      onWordLost: { params: Schema.Struct({}) },
    },
  },
  guards: {
    isValidWord: ({ context }) =>
      canSubmitGuess(
        context.currentGuessWord,
        context.currentTurn,
        context.wordleGuesses,
        Option.getOrElse(context.dictionary, () => EMPTY_DICTIONARY)
      ),

    // Do we have a winner? When the player correctly guesses the secret word, we have a winner
    // Only true when both the secret word and the last guess are present and equal
    isGameWon: ({ context }) => Option.exists(Option.all([context.theSecretWord, Array.last(context.wordleGuesses)]), ([secret, last]) => secret === last),

    // Do we have a loser? When the player runs out of turns, we have a loser
    isGameLost: ({ context }) => context.currentTurn > MAX_TURNS,

    isEnterKey: ({ event }) => {
      assertEvent(event, "keyPressed");
      return classifyKey(event.pressedKey).kind === "enter";
    },

    isBackspaceKey: ({ event }) => {
      assertEvent(event, "keyPressed");
      return classifyKey(event.pressedKey).kind === "backspace";
    },

    isValidLetterKey: ({ context, event }) => {
      assertEvent(event, "keyPressed");
      const key = classifyKey(event.pressedKey);
      if (key.kind !== "letter") return false;

      // Prevent typing letters already ruled out by genuine guesses
      return !HashSet.has(context.greyLetters, key.letter);
    },
  },
  actions: {
    // Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
    trackInvalidGuessSubmitted: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> => trackInvalidGuessSubmitted(),

    // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
    trackValidGuessSubmitted: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> => trackValidGuessSubmitted(wordChallenge),

    // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
    trackWordWon: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordWon(runSession, wordChallenge))),

    // `wordScore` is guaranteed `Some` here (the `wordWon` entry patches it before
    // enqueuing), but the branch is total anyway: an impossible `None` resolves as
    // a no-op instead of a NoSuchElementError that has no recovery
    onWordWon: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Option.isSome(wordChallenge.wordScore) ? Atom.set(gameFlowMachineSendAtom, { type: "word.won", wordScore: wordChallenge.wordScore.value }) : Effect.void,

    // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
    trackWordLost: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordLost(runSession, wordChallenge))),

    onWordLost: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> => Atom.set(gameFlowMachineSendAtom, { type: "word.lost" }),
  },
});
