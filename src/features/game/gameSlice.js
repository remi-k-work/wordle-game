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
  wordleGuesses: [],
  currentTurn: 0,
  isCorrect: false,
  loading: "idle",
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
export const { guessWordSubmitted } = gameSlice.actions;

export default gameSlice.reducer;
