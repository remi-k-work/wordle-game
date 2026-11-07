// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { motion } from "motion/react";
import { T } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { runSessionRunScoreAtom, runSessionStreakAtom } from "@/features/game/state/run-session";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentType, ReactNode, Ref } from "react";

interface RunStatSpec {
  Icon: ComponentType<{ className?: string }>;
  rootClassName: string;
  iconClassName: string;
}

interface RunStatProps {
  stat: RunStatSpec;
  // The live variant attaches its animated counter's ref so the number can be
  // driven imperatively; the skeleton omits the ref and passes the placeholder
  // instead, which is why the ref is optional
  counterRef?: Ref<HTMLElement>;
  children: ReactNode;
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const CARD_CLASSES = cn("grid flex-2 place-items-center rounded-md border bg-secondary px-2 py-1");
const HEADING_CLASSES = cn("font-sans text-sm font-semibold tracking-widest text-text-2 uppercase");
const STATS_ROW_CLASSES = cn("flex w-full items-center justify-around gap-2");
const STAT_CLASSES = cn("flex items-center gap-1");
const VALUE_CLASSES = cn("text-lg font-semibold tabular-nums sm:text-2xl");

// The blank a stat shows while its number is unknown; it holds the row's height
// so the card does not reflow once the real value arrives
const EMPTY_STAT_VALUE = "\u00a0";

const RUN_STATS = {
  runScore: { Icon: TrophyIcon, rootClassName: cn(STAT_CLASSES), iconClassName: "size-6 text-accent sm:size-7" },
  streak: { Icon: FireIcon, rootClassName: cn(STAT_CLASSES, "text-destructive"), iconClassName: "size-6 sm:size-7" },
} as const;

function RunStat({ stat, counterRef, children }: RunStatProps) {
  const { Icon, rootClassName, iconClassName } = stat;

  return (
    <div className={rootClassName}>
      <Icon className={iconClassName} />
      <span ref={counterRef} className={VALUE_CLASSES}>
        {children}
      </span>
    </div>
  );
}

// Everything between the card and its two stats: the heading, and the row the
// stats sit in. Stated once because the live card and its skeleton share it —
// the two differ only in the values their stats show and whether those values
// are animated
function RunCardContent({
  runScore,
  streak,
  runScoreRef,
  streakRef,
}: {
  runScore: ReactNode;
  streak: ReactNode;
  runScoreRef?: Ref<HTMLElement>;
  streakRef?: Ref<HTMLElement>;
}) {
  return (
    <>
      <h2 className={HEADING_CLASSES}>
        <T>Run</T>
      </h2>

      <div className={STATS_ROW_CLASSES}>
        <RunStat stat={RUN_STATS.runScore} counterRef={runScoreRef}>
          {runScore}
        </RunStat>
        <RunStat stat={RUN_STATS.streak} counterRef={streakRef}>
          {streak}
        </RunStat>
      </div>
    </>
  );
}

export function Run() {
  const runScore = useAtomValue(runSessionRunScoreAtom);
  const streak = useAtomValue(runSessionStreakAtom);
  const locale = useLocale();
  const runScoreRef = useAnimatedCounter(runScore, locale);
  const streakRef = useAnimatedCounter(streak, locale);

  return (
    <motion.section initial={{ opacity: 0, y: MOTION_TOKENS.distance.sm }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.gentle} className={CARD_CLASSES}>
      <RunCardContent runScore={runScore.toLocaleString(locale)} streak={streak.toLocaleString(locale)} runScoreRef={runScoreRef} streakRef={streakRef} />
    </motion.section>
  );
}

export function RunSkeleton() {
  return (
    <section className={CARD_CLASSES}>
      <RunCardContent runScore={EMPTY_STAT_VALUE} streak={EMPTY_STAT_VALUE} />
    </section>
  );
}
