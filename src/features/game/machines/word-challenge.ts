// services, features, and other libraries
import { Array, DateTime, Effect, HashSet, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { calculateScore, computeGreyLetters } from "@/features/game/domain/game-logic";
import { canSubmitGuess, classifyKey } from "@/features/game/domain/validators";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state/actions";
import { TheSecretWord, WordChallenge } from "@/features/game/domain/models";

// constants
import { initialWordChallenge, MAX_TURNS, WORD_LENGTH } from "@/features/game/domain/constants";

// Shared empty dictionary reused for the no-guesses-yet case, so the per-keypress
// `isValidWord` guard doesn't allocate a fresh HashSet on every keystroke
const EMPTY_DICTIONARY = HashSet.empty<string>();

// Save the dictionary provided by the game data machine (no word yet)
const saveGameDataContext = (dictionary: WordChallenge["dictionary"]): WordChallenge => ({ ...initialWordChallenge(), dictionary });

// Set up the board for a new puzzle with the secret word from gameDataMachine
const startNewPuzzleContext = (dictionary: WordChallenge["dictionary"], theSecretWord: TheSecretWord): WordChallenge => ({
  ...initialWordChallenge(),
  dictionary,
  theSecretWord: Option.some(theSecretWord),
});

// Append a letter (never past full length); lazily start the clock on the first letter
const addLetterContext = (context: WordChallenge, pressedKey: string): WordChallenge => ({
  ...context,
  currentGuessWord: context.currentGuessWord.length < WORD_LENGTH ? context.currentGuessWord + pressedKey.toUpperCase() : context.currentGuessWord,
  startTime: Option.orElse(context.startTime, () => Option.some(DateTime.nowUnsafe())),
});

// Remove the last letter from the current guess word
const removeLetterContext = (context: WordChallenge): WordChallenge => ({ ...context, currentGuessWord: context.currentGuessWord.slice(0, -1) });

// Record the guess, advance the turn, and recompute grey letters once per submission
const submitGuessContext = (context: WordChallenge): WordChallenge => {
  const wordleGuesses = Array.append(context.wordleGuesses, context.currentGuessWord);
  return {
    ...context,
    currentGuessWord: "",
    wordleGuesses,
    currentTurn: context.currentTurn + 1,
    greyLetters: Option.match(context.theSecretWord, {
      onNone: () => context.greyLetters,
      onSome: (theSecretWord) => computeGreyLetters(theSecretWord, wordleGuesses),
    }),
  };
};

// Calculate the player's word score from the turn they won on and how long it took
const calculateScoreContext = (context: WordChallenge): WordChallenge => ({
  ...context,
  wordScore: Option.some(calculateScore(context.currentTurn - 1, context.startTime, DateTime.nowUnsafe())),
});

export const wordChallengeMachine = setupEffect({
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
    isGameWon: ({ context }) =>
      Option.match(Option.all([context.theSecretWord, Array.last(context.wordleGuesses)]), {
        onNone: () => false,
        onSome: ([secret, last]) => secret === last,
      }),

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
      Option.match(wordChallenge.wordScore, {
        onNone: () => Effect.void,
        onSome: (wordScore) => Atom.set(gameFlowMachineSendAtom, { type: "word.won", wordScore }),
      }),

    // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
    trackWordLost: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordLost(runSession, wordChallenge))),

    onWordLost: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> => Atom.set(gameFlowMachineSendAtom, { type: "word.lost" }),
  },
}).createMachine({
  id: "wordChallenge",
  context: initialWordChallenge(),
  initial: "awaitingGameData",

  on: {
    // Language changed → reset to awaiting new data
    solutionsLanguageChanged: { target: ".awaitingGameData", context: () => initialWordChallenge() },

    // Forfeit the active run
    forfeitedRun: { target: ".runForfeited" },

    // Data loaded (initial or after language change) → park in idle
    gameDataLoaded: {
      target: ".idle",
      context: (args) => {
        assertEvent(args.event, "gameDataLoaded");
        return saveGameDataContext(args.event.dictionary);
      },
    },

    // New puzzle word picked by gameDataMachine → start typing (only once a dictionary exists)
    secretWordPicked: (args) => {
      assertEvent(args.event, "secretWordPicked");
      const dictionary = args.context.dictionary;
      if (!Option.isSome(dictionary)) return;
      return { target: ".typing", context: startNewPuzzleContext(dictionary, args.event.theSecretWord) };
    },
  },

  states: {
    // Waiting for the game data to be loaded
    awaitingGameData: {},

    // Data is loaded but no puzzle is active — waiting for "Start New Run" or "Next Word"
    idle: {},

    // User is actively building their current guess
    typing: {
      on: {
        // The machine now routes the raw keyboard input natively
        keyPressed: (args) => {
          if (args.guards.isEnterKey(args)) return { target: "validating" };
          if (args.guards.isBackspaceKey(args)) return { context: removeLetterContext(args.context) };
          if (args.guards.isValidLetterKey(args)) {
            assertEvent(args.event, "keyPressed");
            return { context: addLetterContext(args.context, args.event.pressedKey) };
          }
        },
      },
    },

    // Immediately decide whether the submitted guess is valid
    validating: {
      always: (args, enq) => {
        if (args.guards.isValidWord(args)) {
          enq(args.actions.trackValidGuessSubmitted, { self: args.self, wordChallenge: args.context });
          return { target: "revealing", context: submitGuessContext(args.context) };
        }
        return { target: "rejected" };
      },
    },

    // Invalid word entered; recover as soon as the user edits it
    rejected: {
      entry: (args, enq) => {
        enq(args.actions.trackInvalidGuessSubmitted, { self: args.self });
      },

      // Only allow Backspace to manually interrupt the error state
      on: {
        keyPressed: (args) => {
          if (args.guards.isBackspaceKey(args)) return { target: "typing", context: removeLetterContext(args.context) };
        },
      },

      // Auto-recover back to typing after the CSS "shake" animation completes
      after: { 4000: { target: "typing" } },
    },

    // Inputs are locked while tile flip animations play
    revealing: {
      after: {
        1500: (args) => {
          if (args.guards.isGameWon(args)) return { target: "wordWon" };
          if (args.guards.isGameLost(args)) return { target: "wordLost" };
          return { target: "typing" };
        },
      },
    },

    // Word won, waiting for next word being requested
    wordWon: {
      entry: (args, enq) => {
        const context = calculateScoreContext(args.context);
        enq(args.actions.trackWordWon, { self: args.self, wordChallenge: context });
        enq(args.actions.onWordWon, { self: args.self, wordChallenge: context });
        return { context };
      },
    },

    // Word lost, waiting for the new run to start
    wordLost: {
      entry: (args, enq) => {
        enq(args.actions.trackWordLost, { self: args.self, wordChallenge: args.context });
        enq(args.actions.onWordLost, { self: args.self });
      },
    },

    // Run forfeited, waiting for the new run to start
    runForfeited: {},
  },
});
