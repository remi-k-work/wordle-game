// redux stuff
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// helpers
import { waait } from "../../js/helpers";

// First, create the thunk
export const fetchSolutions = createAsyncThunk("game/fetchSolutions", async function () {
  await waait();

  const response = await fetch("/data/db.json");
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
  isCorrect: false,
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
    guessWordSubmitted(state, action) {
      // Do we have a winner?
      if (state.theSecretWord === state.currentGuessWord) {
        state.isCorrect = true;
      }

      // Add the most recent guess word to the history
      state.wordleGuesses.push(state.currentGuessWord);

      // Start a new turn
      state.currentTurn++;

      // Clear the guess word currently in use
      state.currentGuessWord = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSolutions.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchSolutions.fulfilled, (state, action) => {
      // Destructure the payload
      const solutions = action.payload;

      state.loading = "idle";
      const randomSolution = solutions[Math.floor(Math.random() * solutions.length)].word;

      state.theSecretWord = randomSolution;
    });
    builder.addCase(fetchSolutions.rejected, (state, action) => {
      state.loading = "rejected";
    });
  },
});

// Action creators are generated for each case reducer function
export const { guessWordChanged, guessWordSubmitted } = gameSlice.actions;

export default gameSlice.reducer;
