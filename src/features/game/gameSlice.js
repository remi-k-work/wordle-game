// redux stuff
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theSecretWord: "DRAIN",
  wordleGuesses: [],
  currentTurn: 0,
  isCorrect: false,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // A new valid guess word was submitted by the user
    guessWordSubmitted(state, action) {
      // Destructure the payload
      const currentGuessWord = action.payload;

      // Do we have a winner?
      if (state.theSecretWord === currentGuessWord) {
        state.isCorrect = true;
      }

      // Add the most recent guess word to the history
      state.wordleGuesses.push(currentGuessWord);

      // Start a new turn
      state.currentTurn++;
    },
  },
});

// Action creators are generated for each case reducer function
export const { guessWordSubmitted } = gameSlice.actions;

export default gameSlice.reducer;
