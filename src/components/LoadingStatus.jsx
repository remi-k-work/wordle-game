// component css styles
import styles from "./LoadingStatus.module.css";

// redux stuff
import { useSelector } from "react-redux";

// assets
import spinner from "../assets/spinner.svg";

export default function LoadingStatus({ loading = "pending" }) {
  const { language } = useSelector((store) => store.controlPanel);

  if (loading === "pending") {
    return language === "en" ? (
      <section className={styles["loading-status"]}>
        <img src={spinner} width={24} alt="Loading..." />
        <h3>Loading...</h3>
      </section>
    ) : (
      <section className={styles["loading-status"]}>
        <img src={spinner} width={24} alt="Ładuję..." />
        <h3>Ładuję, proszę czekać...</h3>
      </section>
    );
  }

  if (loading === "rejected") {
    return language === "en" ? (
      <section className={styles["loading-status"]}>
        <h3>Oops! There was an error!</h3>
      </section>
    ) : (
      <section className={styles["loading-status"]}>
        <h3>Uwaga! Wystąpił błąd aplikacji!</h3>
      </section>
    );
  }
}
