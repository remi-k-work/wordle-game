// react
import { useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { highScoreNewHighScoreIdAtom, top10HighScoresAtom } from "@/features/high-score/state/high-score";
import { motion } from "motion/react";
import { useLocale } from "gt-tanstack-start";
import { T } from "gt-react";

// components
import { InfoLine } from "@/ui/info-line";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import { Top10TableHeader } from "./top-10-table-header";
import { Top10HighScoresSkeleton } from "./skeleton";

// assets
import { PlFlagIcon } from "@/assets/icons/pl-flag";
import { UsFlagIcon } from "@/assets/icons/us-flag";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

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

export function Top10HighScores({ solutionsLanguage }: Top10HighScoresProps) {
  const top10HighScores = useAtomValue(top10HighScoresAtom(solutionsLanguage));
  const newHighScoreId = useAtomValue(highScoreNewHighScoreIdAtom);
  const locale = useLocale();

  useEffect(() => {
    if (top10HighScores.waiting || !newHighScoreId.valueOrUndefined) return;
    const animationId = requestAnimationFrame(() => document.getElementById("newHighScoreRow")?.scrollIntoView({ behavior: "smooth", block: "center" }));

    return () => cancelAnimationFrame(animationId);
  }, [top10HighScores.waiting, newHighScoreId.valueOrUndefined]);

  return AsyncResult.builder(top10HighScores)
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
              <MotionTableRow
                key={id}
                id={id === newHighScoreId.valueOrUndefined ? "newHighScoreRow" : undefined}
                className={cn("odd:bg-surface-2", id === newHighScoreId.valueOrUndefined && "animate-wiggle bg-accent odd:bg-accent")}
                variants={ROW_VARIANTS}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{playerName}</TableCell>
                <TableCell className="bg-accent/30">{score.toLocaleString(locale)}</TableCell>
                <TableCell className="bg-destructive/30">{streak.toLocaleString(locale)}</TableCell>
                <TableCell>
                  {Match.value(solutionsLang).pipe(
                    Match.when("En", () => <UsFlagIcon className="mx-auto size-11" />),
                    Match.when("Pl", () => <PlFlagIcon className="mx-auto size-11" />),
                    Match.exhaustive
                  )}
                </TableCell>
              </MotionTableRow>
            ))}
          </MotionTableBody>
        </Table>
      )
    )
    .render();
}
