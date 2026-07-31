"use client";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { highScoreNewHighScoreIdAtom, top10HighScoresAtom } from "@/features/high-score/state";
import { motion } from "motion/react";

// components
import { InfoLine } from "@/ui/info-line";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface Top10HighScoresProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: motionTokens.duration.fast } },
} as const;

const rowVariants = {
  hidden: { opacity: 0, y: motionTokens.distance.sm },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
} as const;

const MotionTableBody = motion.create(TableBody);
const MotionTableRow = motion.create(TableRow);

export function Top10HighScores({ solutionsLanguage }: Top10HighScoresProps) {
  const top10HighScores = useAtomValue(top10HighScoresAtom(solutionsLanguage));
  const newHighScoreId = useAtomValue(highScoreNewHighScoreIdAtom);

  return AsyncResult.builder(top10HighScores)
    .onInitialOrWaiting(() => <Top10HighScoresSkeleton />)
    .onFailure(() => <Top10HighScoresSkeleton />)
    .onSuccess((top10HighScores) =>
      top10HighScores.length === 0 ? (
        <InfoLine message="No High Scores yet!" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="w-32">Name</TableHead>
              <TableHead className="w-32 bg-accent/30 text-accent">
                <TrophyIcon className="mx-auto size-11" />
              </TableHead>
              <TableHead className="w-24 bg-destructive/30 text-destructive">
                <FireIcon className="mx-auto size-11" />
              </TableHead>
              <TableHead className="w-24">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <MotionTableBody variants={containerVariants} initial="hidden" animate="visible">
            {top10HighScores.map(({ id, playerName, score, streak, solutionsLang }, index: number) => (
              <MotionTableRow
                key={id}
                className={cn("odd:bg-surface-2", id === Option.getOrUndefined(newHighScoreId) && "animate-wiggle bg-accent odd:bg-accent")}
                variants={rowVariants}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{playerName}</TableCell>
                <TableCell className="bg-accent/30">{score.toLocaleString()}</TableCell>
                <TableCell className="bg-destructive/30">{streak.toLocaleString()}</TableCell>
                <TableCell>{solutionsLang === "En" ? <UsFlagIcon className="mx-auto size-11" /> : <PlFlagIcon className="mx-auto size-11" />}</TableCell>
              </MotionTableRow>
            ))}
          </MotionTableBody>
        </Table>
      )
    )
    .render();
}

export function Top10HighScoresSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead className="w-32">Name</TableHead>
          <TableHead className="w-32 bg-accent/30 text-accent">
            <TrophyIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24 bg-destructive/30 text-destructive">
            <FireIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, index: number) => (
          <TableRow key={index} className="odd:bg-surface-2">
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <div className="mx-auto h-4 w-12 animate-pulse bg-accent" />
            </TableCell>
            <TableCell className="bg-accent/30">
              <div className="mx-auto h-4 w-16 animate-pulse bg-accent" />
            </TableCell>
            <TableCell className="bg-destructive/30">
              <div className="mx-auto h-4 w-8 animate-pulse bg-accent" />
            </TableCell>
            <TableCell>
              <div className="mx-auto size-11 animate-pulse bg-accent" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
