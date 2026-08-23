// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { motion } from "motion/react";
import { T, useLocale } from "gt-next";
import { runSessionRunScoreAtom, runSessionStreakAtom } from "@/features/game/state";
import { useAnimatedCounter } from "@/hooks";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

export function Run() {
  const runScore = useAtomValue(runSessionRunScoreAtom);
  const streak = useAtomValue(runSessionStreakAtom);
  const locale = useLocale();
  const runScoreRef = useAnimatedCounter(runScore, (value) => Math.round(value).toLocaleString(locale));
  const streakRef = useAnimatedCounter(streak, (value) => Math.round(value).toLocaleString(locale));

  return (
    <motion.section
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.gentle}
      className="grid flex-2 place-items-center rounded-md border bg-secondary px-2 py-1"
    >
      <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase"><T>Run</T></h2>
      <div className="flex w-full items-center justify-around gap-2">
        <div className="flex items-center gap-1">
          <TrophyIcon className="size-6 text-accent sm:size-7" />
          <span ref={runScoreRef} className="text-lg font-semibold tabular-nums sm:text-2xl">
            {runScore.toLocaleString(locale)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-destructive">
          <FireIcon className="size-6 sm:size-7" />
          <span ref={streakRef} className="text-lg font-semibold tabular-nums sm:text-2xl">
            {streak.toLocaleString(locale)}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

export function RunSkeleton() {
  return (
    <section className="grid flex-2 place-items-center rounded-md border bg-secondary px-2 py-1">
      <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase"><T>Run</T></h2>
      <div className="flex w-full items-center justify-around gap-2">
        <div className="flex items-center gap-1">
          <TrophyIcon className="size-6 text-accent sm:size-7" />
          <span className="text-lg font-semibold tabular-nums sm:text-2xl">&nbsp;</span>
        </div>
        <div className="flex items-center gap-1 text-destructive">
          <FireIcon className="size-6 sm:size-7" />
          <span className="text-lg font-semibold tabular-nums sm:text-2xl">&nbsp;</span>
        </div>
      </div>
    </section>
  );
}
