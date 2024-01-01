// component css styles
import styles from "./Modal.module.css";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// modal logic & slice
import { closeModal } from "../modalSlice";

// assets
import close from "../../../assets/close.svg";

export default function Modal({ title, content, onClose = null }) {
  const { language } = useSelector((store) => store.controlPanel);
  const dispatch = useDispatch();

  // Handle a close click
  function handleCloseClick(ev) {
    dispatch(closeModal());
    // Invoke onClose event handler if provided
    if (onClose) {
      onClose();
    }
  }

  return (
    <aside className={styles["modal"]}>
      <dialog open>
        <h1>{title}</h1>
        {content}
        <button type="button" onClick={handleCloseClick}>
          <img src={close} width={24} alt="X" />
          {language === "en" ? "Close" : "Zamknij"}
        </button>
      </dialog>
    </aside>
  );
}
