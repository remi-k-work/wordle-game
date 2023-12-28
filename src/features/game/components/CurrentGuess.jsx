// component css styles
import styles from "./CurrentGuess.module.css";

// react
import { useState, useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// components
import GuessTile from "./GuessTile";

// game logic & slice
import { isGuessKeyEntryValid, isSubmittedGuessValid } from "../gameLogic";
import { guessWordChanged, guessWordSubmitted } from "../gameSlice";

export default function CurrentGuess() {
  const { currentGuessWord, wordleGuesses, currentTurn } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle the keyboard input one key at a time
    function handleKeyUp(ev) {
      const pressedKey = ev.key;

      if (isGuessKeyEntryValid(pressedKey)) {
        // The user has updated the current guess word by tapping a valid key
        dispatch(guessWordChanged(pressedKey));

        if (isSubmittedGuessValid(pressedKey, currentGuessWord, currentTurn, wordleGuesses)) {
          // A new valid guess word was submitted by the user
          dispatch(guessWordSubmitted());
        }
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
