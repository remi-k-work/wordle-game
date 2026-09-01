// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import { DateTime, Option } from "effect";
import { useLocale } from "gt-next";
import { useAtomValue } from "@effect/atom-react";
import {
  runSessionBestRunScoreAtom,
  runSessionBestStreakAtom,
  runSessionCreatedAtAtom,
  runSessionRunIdAtom,
  runSessionRunScoreAtom,
  runSessionStreakAtom,
  runResultAtom,
} from "@/features/game/state";
import { formatDuration } from "@/lib/formatters";

// components
import { T } from "gt-next";

// assets
import { ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function RunScore() {
  const runResult = useAtomValue(runResultAtom);
  const activeRunId = useAtomValue(runSessionRunIdAtom);
  const activeCreatedAt = useAtomValue(runSessionCreatedAtAtom);
  const activeRunScore = useAtomValue(runSessionRunScoreAtom);
  const activeStreak = useAtomValue(runSessionStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);
  const locale = useLocale();

  const [now, setNow] = useState(() => DateTime.makeUnsafe(Date.now()));

  useEffect(() => {
    // If we do not have an active run, time freezes
    if (Option.isNone(activeRunId)) return;

    const interval = setInterval(() => {
      setNow(DateTime.makeUnsafe(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRunId]);

  const summary = Option.match(runResult, {
    onSome: ({ createdAt, finishedAt, runScore, streak }) => Option.some({ createdAt, finishedAt, runScore, streak }),
    onNone: () =>
      Option.map(activeRunId, () => ({
        createdAt: Option.getOrElse(activeCreatedAt, () => now),
        finishedAt: now,
        runScore: activeRunScore,
        streak: activeStreak,
      })),
  });

  return Option.match(summary, {
    onNone: () => null,
    onSome: ({ createdAt, finishedAt, runScore, streak }) => {
      // We calculate the total real-world time the run was alive
      const runDuration = DateTime.distance(createdAt, finishedAt);

      return (
        <section className="grid grid-cols-2 grid-rows-2 border">
          <div className="col-span-2 p-3">
            <h3 className="max-w-none font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
              <T>Run Duration</T>
            </h3>
            <div className="flex items-center justify-center gap-1">
              <ClockIcon className="size-9" />
              <span className="font-sans text-4xl font-semibold wrap-anywhere tabular-nums">{formatDuration(runDuration)}</span>
            </div>
          </div>
          <div className="bg-surface-2 p-3">
            <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
              <T>Run Score</T>
            </h3>
            <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-accent">
              <TrophyIcon className="size-7" />
              {runScore.toLocaleString(locale)}
            </span>
          </div>
          <div className="bg-surface-3 p-3">
            <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
              <T>Streak</T>
            </h3>
            <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-destructive">
              <FireIcon className="size-7" />
              {streak.toLocaleString(locale)}
            </span>
          </div>
          <div className="bg-surface-3 p-3">
            <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
              <T>Best Run Score</T>
            </h3>
            <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-accent">
              <TrophyIcon className="size-7" />
              {bestRunScore.toLocaleString(locale)}
            </span>
          </div>
          <div className="bg-surface-2 p-3">
            <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
              <T>Best Streak</T>
            </h3>
            <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-destructive">
              <FireIcon className="size-7" />
              {bestStreak.toLocaleString(locale)}
            </span>
          </div>
        </section>
      );
    },
  });
}
