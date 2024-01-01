// redux stuff
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// game logic & slice
import { isGuessKeyEntryValid, isSubmittedGuessValid, isGameOver } from "./gameLogic";

// keypad logic & slice
import { visualClueHasChanged } from "../keypad/keypadSlice";

// modal logic & slice
import { openModal } from "../modal/modalSlice";

// helpers
import { waait } from "../../js/helpers";

export function gameLoopStarted(pressedKey) {
  return function (dispatch, getState) {
    // Gain access to the entire store's slices
    let { game } = getState();

    // Is the game already over, or is it still going on?
    if (isGameOver(game.currentTurn, game.theSecretWord, game.wordleGuesses)) {
      // Yes, the game has ended; thus, disregard the user's input and leave the game's loop
      return;
    }

    // Validate the guess entry as the user types from the keyboard in real time
    if (!isGuessKeyEntryValid(pressedKey)) {
      return;
    }

    // The user has updated the current guess word by tapping a valid key
    dispatch(guessWordChanged(pressedKey));

    // Get the most recent game state
    game = getState().game;

    // Accept or reject the submitted guess after validating it
    if (!isSubmittedGuessValid(pressedKey, game.currentGuessWord, game.currentTurn, game.wordleGuesses)) {
      return;
    }

    // A new valid guess word was submitted by the user
    dispatch(guessWordSubmitted());

    // Get the most recent game state
    game = getState().game;

    // Because of the new guess submission, the visual clue on the keypad has changed
    dispatch(visualClueHasChanged(game.theSecretWord, game.wordleGuesses));

    // Get the most recent game state
    game = getState().game;

    // Is the game already over, or is it still going on?
    if (isGameOver(game.currentTurn, game.theSecretWord, game.wordleGuesses)) {
      // Depending on the outcome of the game, open the "You Win" or "Nevermind" modal
      dispatch(openModal());
    }
  };
}

// First, create the thunk
export const fetchSolutions = createAsyncThunk("game/fetchSolutions", async function (arg, thunkAPI) {
  // Obtain all of the game's solutions from an outside source
  // await waait();

  // Take the chosen language into consideration
  const { language } = thunkAPI.getState().controlPanel;
  const response = await fetch(`/data/db-${language}.json`);
  if (!response.ok) {
    throw new Error("Unable to obtain the solutions.");
  }

  const data = await response.json();
  return data["solutions"];
});

const initialState = {
  theSecretWord: "",
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 0,
  loading: "idle",
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // The user has updated the current guess word by tapping a valid key
    guessWordChanged(state, action) {
      // Destructure the payload
      const validKey = action.payload;

      // Is the user attempting to submit a guess word?
      if (validKey === "Enter") {
        // Ignore it for the time being, since it will be addressed later
        return;
      }

      // Allow the use of <Backspace> to correct any errors
      if (validKey === "Backspace") {
        state.currentGuessWord = state.currentGuessWord.slice(0, -1);
        return;
      }

      // Make sure the current guess word is no more than 5 letters long
      if (state.currentGuessWord.length < 5) {
        state.currentGuessWord += validKey.toUpperCase();
      }
    },

    // A new valid guess word was submitted by the user
    guessWordSubmitted(state) {
      // Add the most recent guess word to the history
      state.wordleGuesses.push(state.currentGuessWord);

      // Start a new turn
      state.currentTurn++;

      // Clear the guess word currently in use
      state.currentGuessWord = "";
    },

    gameRestarted() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSolutions.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchSolutions.fulfilled, (state, action) => {
      state.loading = "idle";

      // Destructure the payload
      const solutions = action.payload;

      // Choose a random solution from the list and make it the secret word
      const randomSolution = solutions[Math.floor(Math.random() * solutions.length)].word;
      state.theSecretWord = randomSolution;
    });
    builder.addCase(fetchSolutions.rejected, (state) => {
      state.loading = "rejected";
    });
  },
});

// Action creators are generated for each case reducer function
export const { guessWordChanged, guessWordSubmitted, gameRestarted } = gameSlice.actions;

export default gameSlice.reducer;
