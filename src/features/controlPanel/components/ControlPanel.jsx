// component css styles
import styles from "./ControlPanel.module.css";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// game logic & slice
import { gameRestarted, fetchSolutions } from "../../game/gameSlice";

// keypad logic & slice
import { keypadRestarted } from "../../keypad/keypadSlice";

// control panel logic & slice
import { helpRequested, languageChanged } from "../controlPanelSlice";

// modal logic & slice
import { openModal } from "../../modal/modalSlice";

// assets
import turns from "../../../assets/turns.svg";
import help from "../../../assets/help.svg";

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

  // Handle a help click
  function handleHelpClick(ev) {
    dispatch(helpRequested());
    dispatch(openModal());
  }

  return (
    <section className={styles["control-panel"]}>
      <div className={styles["control-panel__turns"]}>
        <img src={turns} width={24} alt="" />
        {currentTurn}
      </div>
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
      {language === "en" ? (
        <button type="button" onClick={handleNewGameClick}>
          New Game
        </button>
      ) : (
        <button type="button" onClick={handleNewGameClick}>
          Nowa Gra
        </button>
      )}
      <button type="button" onClick={handleHelpClick}>
        <img src={help} width={24} alt="" />
      </button>
    </section>
  );
}
