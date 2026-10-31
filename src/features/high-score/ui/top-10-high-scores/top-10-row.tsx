// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// components
import { LanguageFlag } from "@/ui/language-flag";
import { TableCell, TableRow } from "@/ui/table";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface Top10RowProps {
  rank: number;
  playerName: string;
  score: number;
  streak: number;
  solutionsLang: SolutionsLanguage;
  isNewHighScore: boolean;
  locale: string;
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: MOTION_TOKENS.distance.sm },
  visible: { opacity: 1, y: 0, transition: SPRINGS.gentle },
} as const;

// DOM id of the row that holds the newly-set high score, used to scroll it into
// view; defined once here so the JSX and the scroll effect stay in sync
const NEW_HIGH_SCORE_ROW_ID = "newHighScoreRow";

const MotionTableRow = motion.create(TableRow);

// Memoized row: the highlight (`isNewHighScore`) flips for at most one row when a
// new high score is set, so unchanged rows bail out of re-rendering instead of
// recreating their motion row elements on every top-10 update — the same bail-out
// pattern already used by `GuessRow`, `GuessTile`, and `KeypadKey`
export const Top10Row = memo(function Top10Row({ rank, playerName, score, streak, solutionsLang, isNewHighScore, locale }: Top10RowProps) {
  return (
    <MotionTableRow
      id={isNewHighScore ? NEW_HIGH_SCORE_ROW_ID : undefined}
      className={cn("odd:bg-surface-2", isNewHighScore && "animate-wiggle bg-accent odd:bg-accent")}
      variants={ROW_VARIANTS}
    >
      <TableCell>{rank}</TableCell>
      <TableCell>{playerName}</TableCell>
      <TableCell className="bg-accent/30">{score.toLocaleString(locale)}</TableCell>
      <TableCell className="bg-destructive/30">{streak.toLocaleString(locale)}</TableCell>
      <TableCell>
        <LanguageFlag solutionsLanguage={solutionsLang} className="mx-auto size-11" />
      </TableCell>
    </MotionTableRow>
  );
});
