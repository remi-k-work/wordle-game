// redux stuff
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// keypad logic & slice
import { deriveUsedKeys } from "./keypadLogic";

// helpers
import { waait } from "../../js/helpers";

// First, create the thunk
export const fetchLetters = createAsyncThunk("keypad/fetchLetters", async function (arg, thunkAPI) {
  // Get all the letters for this keypad from an outside source
  // await waait();

  // Take the chosen language into consideration
  const { language } = thunkAPI.getState().controlPanel;
  const response = await fetch(`/data/db-${language}.json`);
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

const keypadSlice = createSlice({
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

    keypadRestarted() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLetters.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchLetters.fulfilled, (state, action) => {
      state.loading = "idle";

      // Destructure the payload
      const letters = action.payload;

      // Include only fetched letters in this keypad
      state.letters = letters;
    });
    builder.addCase(fetchLetters.rejected, (state) => {
      state.loading = "rejected";
    });
  },
});

// Action creators are generated for each case reducer function
export const { visualClueHasChanged, keypadRestarted } = keypadSlice.actions;

export default keypadSlice.reducer;
