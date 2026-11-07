// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useLocale } from "gt-tanstack-start";

// components
import { LanguageFlag } from "@/ui/language-flag";
import { TableCell, TableRow } from "@/ui/table";

// types
import type { ComponentProps, ComponentType, Ref } from "react";
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface Top10RowProps {
  rank: number;
  playerName: string;
  score: number;
  streak: number;
  solutionsLang: SolutionsLanguage;
  isNewHighScore: boolean;
  // Attached only while this row holds the newly-set high score, so the table
  // can scroll that element into view through React's own ref system instead of
  // looking the row up by id in the document
  highlightedRowRef?: Ref<HTMLTableRowElement>;
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: MOTION_TOKENS.distance.sm },
  visible: { opacity: 1, y: 0, transition: SPRINGS.gentle },
} as const;

const BaseMotionTableRow = motion.create(TableRow);

// `motion.create()` types its result as a plain `ComponentType`, which under
// React 19 omits `ref` from its props even though motion forwards the prop down
// to the wrapped row element; declaring it here lets the table hand the
// highlighted row a ref through React's own ref system
const MotionTableRow = BaseMotionTableRow as ComponentType<ComponentProps<typeof BaseMotionTableRow> & { ref?: Ref<HTMLTableRowElement> }>;

// Memoized row: the highlight (`isNewHighScore`) flips for at most one row when a
// new high score is set, so unchanged rows bail out of re-rendering instead of
// recreating their motion row elements on every top-10 update — the same bail-out
// pattern already used by `GuessRow`, `GuessTile`, and `KeypadKey`
// `highlightedRowRef` is a stable ref object (or undefined), so forwarding it to
// one row per render keeps that bail-out intact
export const Top10Row = memo(function Top10Row({ rank, playerName, score, streak, solutionsLang, isNewHighScore, highlightedRowRef }: Top10RowProps) {
  // The locale is read here rather than threaded down from the table: the row is
  // the only thing that formats a number, and `useLocale` resolves from the GT
  // React context, so the table no longer needs a subscription it has no
  // rendered use for (the same stance `ScoreHeader`, `TurnMetricSection` and
  // `ScoreFormulaFooter` take)
  const locale = useLocale();

  return (
    <MotionTableRow
      ref={highlightedRowRef}
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
