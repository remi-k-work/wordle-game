import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import gameReducer from "../features/game/gameSlice";
import keypadReducer from "../features/keypad/keypadSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    game: gameReducer,
    keypad: keypadReducer,
  },
});
