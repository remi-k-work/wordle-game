// services, features, and other libraries
import { Array, HashSet, Duration, DateTime, Match, pipe } from "effect";
import { canSubmitGuess, formatGuess, GameActionEnum, GameStatusEnum, isGuessKeyValid, pickStrongerColor } from ".";

// types
import type { Color, GameAction, GameState, Score } from ".";

// constants
import { BASE_POINTS_PER_TURN_MAP, SPEED_MULTIPLIER_RULES } from ".";

// Calculates the player's score based on the turn they won on and how long it took them
export const calculateScore = (currentTurn: number, startTime: DateTime.Utc, endTime: DateTime.Utc) => {
  // Establish the base points based on the turn number in which the secret word was solved
  const basePointsPerTurn = BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;

  // Establish the speed multiplier based on the time it took
  const seconds = DateTime.distanceDuration(startTime, endTime).pipe(Duration.toSeconds);
  const speedMultiplier = SPEED_MULTIPLIER_RULES.find((rule) => seconds < rule.maxSeconds)?.multiplier ?? 0.8;

  return {
    totalScore: Math.round(basePointsPerTurn * speedMultiplier),
    basePointsPerTurn,
    speedMultiplier,
    timeSeconds: Math.floor(seconds),
  } as const satisfies Score;
};

// Calculates the "live" potential score based on current turn and time elapsed
export const calculatePotentialScore = (currentTurn: number, startTime: DateTime.Utc | null, now: DateTime.Utc) => {
  // Establish the base points based on the turn number in which the secret word was solved
  const basePointsPerTurn = BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;
  if (!startTime) return basePointsPerTurn;

  // Establish the speed multiplier based on the time it took
  const seconds = DateTime.distanceDuration(startTime, now).pipe(Duration.toSeconds);
  const speedMultiplier = SPEED_MULTIPLIER_RULES.find((rule) => seconds < rule.maxSeconds)?.multiplier ?? 0.8;

  return Math.round(basePointsPerTurn * speedMultiplier);
};

// Get the current game status by checking the last guess and current turn
export const getGameStatus = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) => {
  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  if (theSecretWord === wordleGuesses.at(-1)) return GameStatusEnum.Won();

  // Do we have a loser? When the player runs out of turns, we have a loser
  if (currentTurn > 6) return GameStatusEnum.Lost();

  // Otherwise, the game is still in progress
  return GameStatusEnum.Playing();
};

// Derive the full 6x5 grid state for rendering based on completed guesses
export const deriveWordleGrid = (theSecretWord: string, wordleGuesses: readonly string[]) =>
  Array.makeBy(6, (rowIndex) =>
    pipe(wordleGuesses[rowIndex], (guess) => (guess ? formatGuess(theSecretWord, guess) : Array.makeBy(5, () => ({ tileKey: "", color: "" as Color }))))
  );

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
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn } = state;
  if (getGameStatus(currentTurn, theSecretWord, wordleGuesses)._tag !== "Playing") return state;

  return Match.value(action).pipe(
    Match.tag("Ignore", () => state),

    // Remove the last letter from the current guess word
    Match.tag("RemoveLetter", () =>
      currentGuessWord.length > 0 ? { ...state, currentGuessWord: currentGuessWord.slice(0, -1), isInvalidGuess: false } : state
    ),

    // Lazily assign startTime on the very first letter typed
    Match.tag("AddLetter", ({ letter }) =>
      currentGuessWord.length < 5 ? { ...state, currentGuessWord: currentGuessWord + letter, isInvalidGuess: false, startTime: state.startTime ?? now } : state
    ),

    Match.tag("SubmitGuess", () => {
      // If it is a full 5-letter guess word but not in the dictionary, make sure to flag it as invalid
      const canSubmit = canSubmitGuess(currentGuessWord, currentTurn, wordleGuesses, dictionary);
      if (currentGuessWord.length === 5 && !canSubmit) return { ...state, isInvalidGuess: true };

      // If the guess word is invalid, exit early (no game state change)
      if (!canSubmit) return state;

      // If the guess word is valid, update the game state by adding it to the list of wordle guesses and incrementing the current turn
      return { ...state, currentGuessWord: "", wordleGuesses: [...wordleGuesses, currentGuessWord], currentTurn: currentTurn + 1, isInvalidGuess: false };
    }),
    Match.exhaustive
  );
};
