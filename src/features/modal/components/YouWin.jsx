// component css styles
import styles from "./YouWin.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function YouWin() {
  const { theSecretWord, currentTurn } = useSelector((store) => store.game);
  const { language } = useSelector((store) => store.controlPanel);

  return language === "en" ? (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>You found the solution in {currentTurn} guesses 😄</p>
    </article>
  ) : (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>Udało Ci się znaleźć rozwiązanie w {currentTurn} odgadnięciach 😄</p>
    </article>
  );
}
