// redux stuff
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, incrementByAmount, incrementAsync } from "../features/counter/counterSlice";

export default function Counter() {
  const { value } = useSelector((store) => store.counter);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => {
            dispatch(increment());
          }}
        >
          Increment
        </button>
        <p>{value}</p>
        <button
          aria-label="Decrement value"
          onClick={() => {
            dispatch(decrement());
          }}
        >
          Decrement
        </button>
        <button
          aria-label="Increment by 25"
          onClick={() => {
            dispatch(incrementAsync(25));
            // dispatch(incrementByAmount(25));
          }}
        >
          Increment by 25
        </button>
      </div>
    </div>
  );
}
