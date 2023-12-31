// component css styles
import styles from "./ControlPanel.module.css";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// game logic & slice
import { gameRestarted, fetchSolutions } from "../../game/gameSlice";

// keypad logic & slice
import { keypadRestarted } from "../../keypad/keypadSlice";

// control panel logic & slice
import { languageChanged } from "../controlPanelSlice";

export default function ControlPanel() {
  const { theSecretWord, currentTurn } = useSelector((store) => store.game);
  const { language } = useSelector((store) => store.controlPanel);
  const dispatch = useDispatch();

  // Handle language change
  function handleLanguageChange(ev) {
    const newLanguage = ev.target.value;
    dispatch(languageChanged(newLanguage));
    dispatch(gameRestarted());
    dispatch(keypadRestarted());
    dispatch(fetchSolutions());
  }

  // Handle a new game click
  function handleNewGameClick(ev) {
    dispatch(gameRestarted());
    dispatch(keypadRestarted());
    dispatch(fetchSolutions());
  }

  return (
    <section className={styles["control-panel"]}>
      {language === "en" ? (
        <span className={styles["control-panel__turns"]}>Guesses: {currentTurn}</span>
      ) : (
        <span className={styles["control-panel__turns"]}>Odgadnięcia: {currentTurn}</span>
      )}
      <label>
        {language === "en" ? (
          <>
            <small>Language</small>
            <select name="language" value={language} onChange={handleLanguageChange}>
              <option value={"en"}>English</option>
              <option value={"pl"}>Polish</option>
            </select>
          </>
        ) : (
          <>
            <small>Język</small>
            <select name="language" value={language} onChange={handleLanguageChange}>
              <option value={"en"}>Angielski</option>
              <option value={"pl"}>Polski</option>
            </select>
          </>
        )}
      </label>
      <span>{theSecretWord}</span>
      {language === "en" ? (
        <button type="button" onClick={handleNewGameClick}>
          New Game
        </button>
      ) : (
        <button type="button" onClick={handleNewGameClick}>
          Nowa Gra
        </button>
      )}
    </section>
  );
}
