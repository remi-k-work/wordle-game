// redux stuff
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "en",
};

export const controlPanelSlice = createSlice({
  name: "controlPanel",
  initialState,
  reducers: {
    languageChanged(state, action) {
      // Destructure the payload
      const language = action.payload;

      // Modify the game's language for the vocabulary (solutions) and user interface
      state.language = language;
    },
  },
});

// Action creators are generated for each case reducer function
export const { languageChanged } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
