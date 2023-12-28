// component css styles
import styles from "./GuessTile.module.css";

// other libraries
import cn from "classnames";

export default function GuessTile({ tileKey, color, bounceAnim = false }) {
  return bounceAnim ? (
    <div className={cn(styles["guess-tile"], styles[`guess-tile--${color}`], styles["guess-tile--bounce-anim"])}>
      <div className={styles["guess-tile__letter"]}>{tileKey}</div>
    </div>
  ) : (
    <div className={cn(styles["guess-tile"], styles[`guess-tile--${color}`])}>
      <div className={styles["guess-tile__letter"]}>{tileKey}</div>
    </div>
  );
}
