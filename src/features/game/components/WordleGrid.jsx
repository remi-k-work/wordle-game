// component css styles
import styles from "./WordleGrid.module.css";

// redux stuff
import { useSelector } from "react-redux";

// components
import CurrentGuess from "./CurrentGuess";
import GuessRow from "./GuessRow";

// game logic & slice
import { deriveWordleGrid } from "../gameLogic";

export default function WordleGrid() {
  const { theSecretWord, wordleGuesses, currentTurn } = useSelector((store) => store.game);
  const wordleGrid = deriveWordleGrid(theSecretWord, wordleGuesses);

  return (
    <div className={styles["wordle-grid"]}>
      {wordleGrid.map((guessRow, rowIndex) => {
        return rowIndex === currentTurn ? <CurrentGuess key={rowIndex} /> : <GuessRow key={rowIndex} wordleGrid={wordleGrid} rowIndex={rowIndex} />;
      })}
    </div>
  );
}
