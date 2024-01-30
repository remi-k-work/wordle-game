// redux stuff
import { configureStore } from "@reduxjs/toolkit";

// all redux slices containing the specific data
import gameReducer from "../features/game/gameSlice";
import keypadReducer from "../features/keypad/keypadSlice";
import modalReducer from "../features/modal/modalSlice";
import controlPanelReducer from "../features/controlPanel/controlPanelSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    keypad: keypadReducer,
    modal: modalReducer,
    controlPanel: controlPanelReducer,
  },
});
