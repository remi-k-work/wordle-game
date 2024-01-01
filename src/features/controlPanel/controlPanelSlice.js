// redux stuff
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "en",
  showHelp: false,
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

    helpRequested(state) {
      state.showHelp = true;
    },

    helpClosed(state) {
      state.showHelp = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { languageChanged, helpRequested, helpClosed } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
