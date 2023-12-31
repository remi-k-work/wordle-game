// redux stuff
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
};

export const controlPanelSlice = createSlice({
  name: "controlPanel",
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true;
    },
    closeModal(state) {
      state.isOpen = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { openModal, closeModal } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
