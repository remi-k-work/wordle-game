import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../features/game/gameSlice";
import keypadReducer from "../features/keypad/keypadSlice";
import modalReducer from "../features/modal/modalSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    keypad: keypadReducer,
    modal: modalReducer,
  },
});
