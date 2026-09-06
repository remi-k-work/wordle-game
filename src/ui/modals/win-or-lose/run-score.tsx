// oxlint-disable effecttsgo/global-date effecttsgo/global-timers

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
import { RunStat } from "./run-stat";

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

  // NOTE: React state initializer + interval callback are synchronous contexts —
  // `DateTime.now` (an Effect) and `Schedule` are unavailable here. `Date.now()`
  // with the canonical `useEffect` cleanup below is the idiomatic React pattern.
  const [now, setNow] = useState(() => DateTime.makeUnsafe(Date.now()));

  useEffect(() => {
    // Freeze the clock when there is no active run, or when the run already
    // finished (the modal then shows the final result, not a live timer).
    if (Option.isNone(activeRunId) || Option.isSome(runResult)) return;

    const interval = setInterval(() => {
      setNow(DateTime.makeUnsafe(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRunId, runResult]);

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
          <RunStat label={<T>Run Score</T>} bg="bg-surface-2 p-3" Icon={TrophyIcon} iconClassName="text-accent">
            {runScore.toLocaleString(locale)}
          </RunStat>
          <RunStat label={<T>Streak</T>} bg="bg-surface-3 p-3" Icon={FireIcon} iconClassName="text-destructive">
            {streak.toLocaleString(locale)}
          </RunStat>
          <RunStat label={<T>Best Run Score</T>} bg="bg-surface-3 p-3" Icon={TrophyIcon} iconClassName="text-accent">
            {bestRunScore.toLocaleString(locale)}
          </RunStat>
          <RunStat label={<T>Best Streak</T>} bg="bg-surface-2 p-3" Icon={FireIcon} iconClassName="text-destructive">
            {bestStreak.toLocaleString(locale)}
          </RunStat>
        </section>
      );
    },
  });
}
