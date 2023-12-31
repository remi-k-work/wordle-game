// component css styles
import styles from "./Nevermind.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function Nevermind() {
  const { theSecretWord } = useSelector((store) => store.game);
  const { language } = useSelector((store) => store.controlPanel);

  return language === "en" ? (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>Better luck next time 😄</p>
    </article>
  ) : (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>Więcej szczęścia następnym razem 😄</p>
    </article>
  );
}
