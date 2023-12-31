// component css styles
import styles from "./ControlPanel.module.css";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// game logic & slice
import { gameRestarted, fetchSolutions } from "../../game/gameSlice";

// keypad logic & slice
import { keypadRestarted } from "../../keypad/keypadSlice";

export default function ControlPanel() {
  const { theSecretWord, currentTurn } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  // Handle a new game click
  function handleNewGameClick(ev) {
    dispatch(gameRestarted());
    dispatch(keypadRestarted());
    dispatch(fetchSolutions());
  }

  return (
    <section className={styles["control-panel"]}>
      <span className={styles["control-panel__turns"]}>Guesses: {currentTurn}</span>
      <span>{theSecretWord}</span>
      <button type="button" onClick={handleNewGameClick}>
        New Game
      </button>
    </section>
  );
}
