// component css styles
import styles from "./LoadingStatus.module.css";

export default function LoadingStatus({ loading = "pending" }) {
  if (loading === "pending") {
    return (
      <section className={styles["loading-status"]}>
        <h3>Loading...</h3>
      </section>
    );
  }

  if (loading === "rejected") {
    return (
      <section className={styles["loading-status"]}>
        <h3>Oops! There was an error!</h3>
      </section>
    );
  }
}
