// component css styles
import styles from "./Modal.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function Modal() {
  const { theSecretWord, currentTurn, isCorrect } = useSelector((store) => store.game);

  return (
    <aside className={styles["modal"]}>
      <dialog open>
        {isCorrect && (
          <article>
            <h1>You Win!</h1>
            <p className={styles["solution"]}>{theSecretWord}</p>
            <p>You found the solution in {currentTurn} guesses 😄</p>
          </article>
        )}
        {!isCorrect && (
          <article>
            <h1>Nevermind</h1>
            <p className={styles["solution"]}>{theSecretWord}</p>
            <p>Better luck next time 😄</p>
          </article>
        )}
      </dialog>
    </aside>
  );
}
