// component css styles
import styles from "./YouWin.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function YouWin() {
  const { theSecretWord, currentTurn } = useSelector((store) => store.game);

  return (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>You found the solution in {currentTurn} guesses 😄</p>
    </article>
  );
}
