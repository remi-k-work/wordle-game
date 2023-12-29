// component css styles
import styles from "./Keypad.module.css";

// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// other libraries
import cn from "classnames";

// keypad logic & slice
import { fetchLetters } from "../keypadSlice";

// game logic & slice
import { handleGuessKeyUp } from "../../game/gameLogic";

export default function Keypad() {
  const { letters, usedKeys, loading } = useSelector((store) => store.keypad);
  const { currentGuessWord, wordleGuesses, currentTurn } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLetters());
  }, []);

  // Handle the user's keystrokes on the keypad
  function handleKeypadClick(ev) {
    const pressedKey = ev.target.name;

    handleGuessKeyUp(pressedKey, currentGuessWord, currentTurn, wordleGuesses, dispatch);
  }

  if (loading === "pending") {
    return (
      <section className={styles["keypad-status"]}>
        <h3>Loading...</h3>
      </section>
    );
  }

  if (loading === "rejected") {
    return (
      <section className={styles["keypad-status"]}>
        <h3>Oops! There was an error!</h3>
      </section>
    );
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
        ⌫
      </button>
      <button type="button" aria-disabled="true" tabIndex={-1} name="Enter" className={styles["keypad__key"]}>
        ⏎
      </button>
    </section>
  );
}
