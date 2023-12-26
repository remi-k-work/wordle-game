// component css styles
import styles from "./CurrentGuess.module.css";

// react
import { useState, useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// components
import GuessTile from "./GuessTile";

// game logic & slice
import { validateGuessEntry, validateGuessSubmit } from "../features/game/gameLogic";
import { guessWordSubmitted } from "../features/game/gameSlice";

export default function CurrentGuess() {
  const { currentTurn, wordleGuesses } = useSelector((store) => store.game);
  const [currentGuessWord, setCurrentGuessWord] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle the keyboard input one key at a time
    function handleKeyUp(ev) {
      const key = ev.key;

      validateGuessEntry(key, currentGuessWord, setCurrentGuessWord);
      if (validateGuessSubmit(key, currentGuessWord, currentTurn, wordleGuesses)) {
        dispatch(guessWordSubmitted(currentGuessWord));

        // Clear the guess word currently in use
        setCurrentGuessWord("");
      }
    }

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentGuessWord]);

  return (
    <div className={styles["current-guess"]}>
      {[...currentGuessWord, ...Array(5 - [...currentGuessWord].length)].map((tileKey, tileIndex) => {
        return tileKey ? (
          <GuessTile key={tileIndex} tileKey={tileKey} color={""} bounceAnim={true} />
        ) : (
          <GuessTile key={tileIndex} tileKey={tileKey} color={""} />
        );
      })}
    </div>
  );
}
