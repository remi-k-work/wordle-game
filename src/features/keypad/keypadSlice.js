// redux stuff
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// helpers
import { waait } from "../../js/helpers";

// First, create the thunk
export const fetchLetters = createAsyncThunk("keypad/fetchLetters", async function () {
  await waait();

  const response = await fetch("/data/db.json");
  if (!response.ok) {
    throw Error("Unable to obtain the letters.");
  }

  const data = await response.json();
  return data["letters"];
});

const initialState = {
  letters: [],
  loading: "idle",
};

export const keypadSlice = createSlice({
  name: "keypad",
  initialState,
  reducers: {
    test(state) {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLetters.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchLetters.fulfilled, (state, action) => {
      state.loading = "idle";
    });
    builder.addCase(fetchLetters.rejected, (state, action) => {
      state.loading = "rejected";
    });
  },
});

// Action creators are generated for each case reducer function
export const { test } = keypadSlice.actions;

export default keypadSlice.reducer;
