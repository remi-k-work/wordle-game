// react
import { memo, useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { highScoreNewHighScoreIdAtom, top10HighScoresAtom } from "@/features/high-score/state/high-score";
import { motion } from "motion/react";
import { T } from "gt-react";
import { useLocale } from "gt-tanstack-start";

// components
import { InfoLine } from "@/ui/info-line";
import { LanguageFlag } from "@/ui/language-flag";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import { Top10TableHeader } from "./top-10-table-header";
import { Top10HighScoresSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface Top10RowProps {
  rank: number;
  playerName: string;
  score: number;
  streak: number;
  solutionsLang: "En" | "Pl";
  isNewHighScore: boolean;
  locale: string;
}

interface Top10HighScoresProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: motionTokens.duration.fast } },
} as const;

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: motionTokens.distance.sm },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
} as const;

const MotionTableBody = motion.create(TableBody);
const MotionTableRow = motion.create(TableRow);

// DOM id of the row that holds the newly-set high score, used to scroll it into
// view; defined once here so the JSX and the scroll effect stay in sync
const NEW_HIGH_SCORE_ROW_ID = "newHighScoreRow";

// Memoized row: the highlight (`isNewHighScore`) flips for at most one row when a
// new high score is set, so unchanged rows bail out of re-rendering instead of
// recreating their motion row elements on every top-10 update — the same bail-out
// pattern already used by `GuessRow`, `GuessTile`, and `KeypadKey`
const Top10Row = memo(function Top10Row({ rank, playerName, score, streak, solutionsLang, isNewHighScore, locale }: Top10RowProps) {
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

export function Top10HighScores({ solutionsLanguage }: Top10HighScoresProps) {
  const top10Result = useAtomValue(top10HighScoresAtom(solutionsLanguage));
  const newHighScoreId = useAtomValue(highScoreNewHighScoreIdAtom);
  const highlightedHighScoreId = newHighScoreId.valueOrUndefined;
  const locale = useLocale();

  // Scroll the newly-set high score row into view once its data has loaded
  // `top10Result` is the AsyncResult; `.waiting` flips to false when data arrives
  useEffect(() => {
    if (top10Result.waiting || highlightedHighScoreId === undefined) return;
    const animationId = requestAnimationFrame(() => document.getElementById(NEW_HIGH_SCORE_ROW_ID)?.scrollIntoView({ behavior: "smooth", block: "center" }));

    return () => cancelAnimationFrame(animationId);
  }, [top10Result.waiting, highlightedHighScoreId]);

  return AsyncResult.builder(top10Result)
    .onInitialOrWaiting(() => <Top10HighScoresSkeleton />)
    .onFailure(() => <Top10HighScoresSkeleton />)
    .onSuccess((top10HighScores) =>
      top10HighScores.length === 0 ? (
        <InfoLine message={<T>No High Scores yet!</T>} />
      ) : (
        <Table>
          <Top10TableHeader />
          <MotionTableBody variants={CONTAINER_VARIANTS} initial="hidden" animate="visible">
            {top10HighScores.map(({ id, playerName, score, streak, solutionsLang }, index: number) => (
              <Top10Row
                key={id}
                rank={index + 1}
                playerName={playerName}
                score={score}
                streak={streak}
                solutionsLang={solutionsLang}
                isNewHighScore={id === highlightedHighScoreId}
                locale={locale}
              />
            ))}
          </MotionTableBody>
        </Table>
      )
    )
    .render();
}
