// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { highScoreNewHighScoreIdAtom, top10HighScoresAtom } from "@/features/high-score/state/high-score";
import { motion } from "motion/react";
import { T } from "gt-react";
import { useLocale } from "gt-tanstack-start";

// components
import { InfoLine } from "@/ui/info-line";
import { Table, TableBody } from "@/ui/table";
import { Top10TableHeader } from "./top-10-table-header";
import { Top10Row } from "./top-10-row";
import { Top10HighScoresSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface Top10HighScoresProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { MOTION_TOKENS } from "@/lib/motion-tokens";

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: MOTION_TOKENS.duration.fast } },
} as const;

// DOM id of the row that holds the newly-set high score, used to scroll it into
// view; defined once here so the JSX and the scroll effect stay in sync
const NEW_HIGH_SCORE_ROW_ID = "newHighScoreRow";

const MotionTableBody = motion.create(TableBody);

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
