// services, features, and other libraries
import { Array, HashSet, DateTime, Match, pipe, Option } from "effect";
import {
  canSubmitGuess,
  elapsedSeconds,
  formatGuess,
  GameActionEnum,
  GameEventEnum,
  GameStatusEnum,
  getBasePointsForTurn,
  getGameStateStatus,
  getSpeedMultiplier,
  isGamePlaying,
  isGuessKeyValid,
  pickStrongerColor,
} from ".";

// types
import type { Color, GameAction, GameEvent, GameState, WordScore } from ".";

// constants
import { MAX_TURNS, WORD_LENGTH } from ".";

// Calculates the player's word score based on the turn they won on and how long it took them
// This denotes the volatile points earned for the current word before they are banked into the run
export const calculateScore = (currentTurn: number, startTime: Option.Option<DateTime.Utc>, endTime: DateTime.Utc) => {
  const basePointsPerTurn = getBasePointsForTurn(currentTurn);
  const seconds = elapsedSeconds(startTime, endTime);
  const speedMultiplier = getSpeedMultiplier(seconds);

  return {
    wordScore: Math.round(basePointsPerTurn * speedMultiplier),
    basePointsPerTurn,
    speedMultiplier,
    timeSeconds: Math.floor(seconds),
  } as const satisfies WordScore;
};

// Calculates the "live" potential word score based on current turn and time elapsed
// This projects what the player stands to gain based on their current speed and turn count
export const calculatePotentialScore = (currentTurn: number, startTime: Option.Option<DateTime.Utc>, now: DateTime.Utc) =>
  Math.round(getBasePointsForTurn(currentTurn) * getSpeedMultiplier(elapsedSeconds(startTime, now)));

// Get the current game status by checking the last guess and current turn
export const getGameStatus = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) => {
  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  if (theSecretWord === wordleGuesses.at(-1)) return GameStatusEnum.Won();

  // Do we have a loser? When the player runs out of turns, we have a loser
  if (currentTurn > MAX_TURNS) return GameStatusEnum.Lost();

  // Otherwise, the game is still in progress
  return GameStatusEnum.Playing();
};

// Derive the lifecycle event caused by a state transition, if the transition ended the word
export const deriveGameEvent = (prevState: GameState, nextGameState: GameState, endTime: DateTime.Utc): Option.Option<GameEvent> => {
  if (!isGamePlaying(prevState)) return Option.none();

  const nextStatus = getGameStateStatus(nextGameState);
  if (nextStatus._tag === "Won") return Option.some(GameEventEnum.WordWon({ nextGameState, endTime }));
  if (nextStatus._tag === "Lost") return Option.some(GameEventEnum.WordLost());
  return Option.none();
};

// Compute the final keypad state by reducing all guesses and picking the strongest colors
export const computeKeypadState = (theSecretWord: string, wordleGuesses: readonly string[]) =>
  pipe(
    wordleGuesses,
    Array.flatMap((guess) => formatGuess(theSecretWord, guess)),
    Array.reduce({} as Record<string, Color>, (acc, { tileKey, color }) => {
      acc[tileKey] = pickStrongerColor(acc[tileKey], color);
      return acc;
    })
  );

// Translate raw keyboard input into pure domain actions based on current keypad state
export const parseKey = (pressedKey: string, keypadColors: Record<string, Color>) => {
  // Invalid key -> Ignore
  if (!isGuessKeyValid(pressedKey)) return GameActionEnum.Ignore();

  return Match.value(pressedKey.toUpperCase()).pipe(
    // Greyed key -> Ignore
    Match.when(
      (normalizedKey) => keypadColors[normalizedKey] === "grey",
      () => GameActionEnum.Ignore()
    ),

    // BACKSPACE -> RemoveLetter
    Match.when("BACKSPACE", () => GameActionEnum.RemoveLetter()),

    // ENTER -> SubmitGuess
    Match.when("ENTER", () => GameActionEnum.SubmitGuess()),

    // Letter -> AddLetter
    Match.orElse((normalizedKey) => GameActionEnum.AddLetter({ letter: normalizedKey }))
  );
};

// A pure reducer that handles the state transition logic for each game action
export const applyGameAction = (state: GameState, action: GameAction, dictionary: HashSet.HashSet<string>, now: DateTime.Utc): GameState => {
  // If game is over, freeze state and return exact reference
  const { currentGuessWord, wordleGuesses, currentTurn } = state;
  if (!isGamePlaying(state)) return state;

  return Match.value(action).pipe(
    Match.tag("Ignore", () => state),

    // Remove the last letter from the current guess word
    Match.tag("RemoveLetter", () =>
      currentGuessWord.length > 0 ? { ...state, currentGuessWord: currentGuessWord.slice(0, -1), isInvalidGuess: false } : state
    ),

    // Lazily assign startTime on the very first letter typed
    Match.tag("AddLetter", ({ letter }) =>
      currentGuessWord.length < WORD_LENGTH
        ? {
            ...state,
            currentGuessWord: currentGuessWord + letter,
            isInvalidGuess: false,
            startTime: Option.isNone(state.startTime) ? Option.some(now) : state.startTime,
          }
        : state
    ),

    Match.tag("SubmitGuess", () => {
      // If it is a full 5-letter guess word but not in the dictionary, make sure to flag it as invalid
      const canSubmit = canSubmitGuess(currentGuessWord, currentTurn, wordleGuesses, dictionary);
      if (currentGuessWord.length === WORD_LENGTH && !canSubmit) return { ...state, isInvalidGuess: true };

      // If the guess word is invalid, exit early (no game state change)
      if (!canSubmit) return state;

      // If the guess word is valid, update the game state by adding it to the list of wordle guesses and incrementing the current turn
      return { ...state, currentGuessWord: "", wordleGuesses: [...wordleGuesses, currentGuessWord], currentTurn: currentTurn + 1, isInvalidGuess: false };
    }),
    Match.exhaustive
  );
};
