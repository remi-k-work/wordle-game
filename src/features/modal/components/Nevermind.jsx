// component css styles
import styles from "./Nevermind.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function Nevermind() {
  const { theSecretWord } = useSelector((store) => store.game);

  return (
    <article>
      <p className={styles["solution"]}>{theSecretWord}</p>
      <p>Better luck next time 😄</p>
    </article>
  );
}
