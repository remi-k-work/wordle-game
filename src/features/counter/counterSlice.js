import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export function incrementAsync(amount) {
  return async function incrementAsyncThunk(dispatch, getState) {
    setTimeout(() => {
      dispatch(incrementByAmount(amount));
      console.log(getState().game.finalSolution);
    }, 3000);
  };
}

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment(state) {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount: {
      reducer(state, action) {
        state.value += action.payload.amount;
        console.log(state, action);
      },
      prepare(amount, ala) {
        return { payload: { amount, id: nanoid(), ala } };
      },
    },
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
