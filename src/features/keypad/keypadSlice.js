// redux stuff
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// keypad logic & slice
import { deriveUsedKeys } from "./keypadLogic";

// helpers
import { waait } from "../../js/helpers";

// First, create the thunk
export const fetchLetters = createAsyncThunk("keypad/fetchLetters", async function () {
  await waait();

  const response = await fetch("/data/db.json");
  if (!response.ok) {
    throw new Error("Unable to obtain the letters.");
  }

  const data = await response.json();
  return data["letters"];
});

const initialState = {
  letters: [],
  usedKeys: {},
  loading: "idle",
};

export const keypadSlice = createSlice({
  name: "keypad",
  initialState,
  reducers: {
    // Because of the new guess submission, the visual clue on the keypad has changed
    visualClueHasChanged: {
      reducer(state, action) {
        // Destructure the payload
        const { theSecretWord, wordleGuesses } = action.payload;

        state.usedKeys = deriveUsedKeys(theSecretWord, wordleGuesses);
      },
      prepare(theSecretWord, wordleGuesses) {
        return { payload: { theSecretWord, wordleGuesses } };
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLetters.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchLetters.fulfilled, (state, action) => {
      state.loading = "idle";
      state.letters = action.payload;
    });
    builder.addCase(fetchLetters.rejected, (state, action) => {
      state.loading = "rejected";
    });
  },
});

// Action creators are generated for each case reducer function
export const { visualClueHasChanged } = keypadSlice.actions;

export default keypadSlice.reducer;
