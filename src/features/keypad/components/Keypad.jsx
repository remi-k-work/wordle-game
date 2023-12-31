// component css styles
import styles from "./Keypad.module.css";

// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// other libraries
import cn from "classnames";

// components
import LoadingStatus from "../../../components/LoadingStatus";

// keypad logic & slice
import { fetchLetters } from "../keypadSlice";

// game logic & slice
import { gameLoopStarted } from "../../game/gameSlice";

// assets
import backspace from "../../../assets/backspace.svg";
import enter from "../../../assets/enter.svg";

export default function Keypad() {
  const { letters, usedKeys, loading } = useSelector((store) => store.keypad);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLetters());
  }, []);

  // Handle the user's keystrokes on the keypad
  function handleKeypadClick(ev) {
    const pressedKey = ev.target.name;

    // After processing the user's input, we proceed to update the game's state/logic
    dispatch(gameLoopStarted(pressedKey));
  }

  if (loading === "pending" || loading === "rejected") {
    return <LoadingStatus loading={loading} />;
  }

  return (
    <section className={styles["keypad"]} onClick={handleKeypadClick}>
      {letters.map((letter) => {
        const usedKeyColor = usedKeys[letter.key];
        return (
          <button
            type="button"
            aria-disabled="true"
            tabIndex={-1}
            key={letter.key}
            name={letter.key}
            className={cn(styles["keypad__key"], styles[`keypad__key--${usedKeyColor}`])}
          >
            {letter.key}
          </button>
        );
      })}
      <button type="button" aria-disabled="true" tabIndex={-1} name="Backspace" className={styles["keypad__key"]}>
        <img src={backspace} width={24} alt="⌫" />
      </button>
      <button type="button" aria-disabled="true" tabIndex={-1} name="Enter" className={styles["keypad__key"]}>
        <img src={enter} width={24} alt="⏎" />
      </button>
    </section>
  );
}
