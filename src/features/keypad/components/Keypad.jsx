// component css styles
import styles from "./Keypad.module.css";

// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// other libraries
import cn from "classnames";

// keypad logic & slice
import { fetchLetters, visualClueHasChanged } from "../keypadSlice";

// game logic & slice
import { isGuessKeyEntryValid, isSubmittedGuessValid } from "../../game/gameLogic";
import { guessWordChanged, guessWordSubmitted } from "../../game/gameSlice";

export default function Keypad() {
  const { letters, usedKeys, loading } = useSelector((store) => store.keypad);
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLetters());
  }, []);

  useEffect(() => {
    // Because of the new guess submission, the visual clue on the keypad has changed
    dispatch(visualClueHasChanged(theSecretWord, wordleGuesses));
  }, [wordleGuesses]);

  // Handle the user's keystrokes on the keypad
  function handleKeypadClick(ev) {
    const pressedKey = ev.target.name;

    if (isGuessKeyEntryValid(pressedKey)) {
      // The user has updated the current guess word by tapping a valid key
      dispatch(guessWordChanged(pressedKey));

      if (isSubmittedGuessValid(pressedKey, currentGuessWord, currentTurn, wordleGuesses)) {
        // A new valid guess word was submitted by the user
        dispatch(guessWordSubmitted());
      }
    }
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
