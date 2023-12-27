// component css styles
import styles from "./Keypad.module.css";

// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// other libraries
import cn from "classnames";

// keypad logic & slice
import { fetchLetters, visualClueHasChanged } from "./keypadSlice";

export default function Keypad() {
  const { letters, usedKeys, loading } = useSelector((store) => store.keypad);
  const { theSecretWord, wordleGuesses } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLetters());
  }, []);

  useEffect(() => {
    // Because of the new guess submission, the visual clue on the keypad has changed
    dispatch(visualClueHasChanged(theSecretWord, wordleGuesses));
  }, [wordleGuesses]);

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
    <section className={styles["keypad"]}>
      {letters.map((letter) => {
        const usedKeyColor = usedKeys[letter.key];
        return (
          <div key={letter.key} className={cn(styles["keypad__key"], styles[`keypad__key--${usedKeyColor}`])}>
            {letter.key}
          </div>
        );
      })}
    </section>
  );
}
