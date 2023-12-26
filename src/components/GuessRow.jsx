// component css styles
import styles from "./GuessRow.module.css";

// redux stuff
import { useSelector } from "react-redux";

// other libraries
import cn from "classnames";

// components
import GuessTile from "./GuessTile";

export default function GuessRow({ wordleGrid, rowIndex }) {
  const { currentTurn } = useSelector((store) => store.game);

  return rowIndex === currentTurn - 1 ? (
    <div className={cn(styles["guess-row"], styles["guess-row--flip-anim"])}>
      {wordleGrid[rowIndex].map((guessTile, tileIndex) => {
        return <GuessTile key={tileIndex} {...guessTile} />;
      })}
    </div>
  ) : (
    <div className={styles["guess-row"]}>
      {wordleGrid[rowIndex].map((guessTile, tileIndex) => {
        return <GuessTile key={tileIndex} {...guessTile} />;
      })}
    </div>
  );
}
