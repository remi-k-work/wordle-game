// component css styles
import styles from "./Modal.module.css";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// modal logic & slice
import { closeModal } from "../modalSlice";

export default function Modal({ title, content }) {
  const { language } = useSelector((store) => store.controlPanel);
  const dispatch = useDispatch();

  return (
    <aside className={styles["modal"]}>
      <dialog open>
        <h1>{title}</h1>
        {content}
        <button
          type="button"
          onClick={() => {
            dispatch(closeModal());
          }}
        >
          {language === "en" ? "Close" : "Zamknij"}
        </button>
      </dialog>
    </aside>
  );
}
