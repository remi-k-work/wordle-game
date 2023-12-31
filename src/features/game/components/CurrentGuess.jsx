// component css styles
import styles from "./CurrentGuess.module.css";

// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// components
import GuessTile from "./GuessTile";

// game logic & slice
import { gameLoopStarted } from "../gameSlice";

export default function CurrentGuess() {
  const { currentGuessWord } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle the keyboard input one key at a time
    function handleKeyUp(ev) {
      const pressedKey = ev.key;

      // After processing the user's input, we proceed to update the game's state/logic
      dispatch(gameLoopStarted(pressedKey));
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
