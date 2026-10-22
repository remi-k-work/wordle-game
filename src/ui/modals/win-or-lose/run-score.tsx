// oxlint-disable effecttsgo/global-date effecttsgo/global-timers

// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import { DateTime, Option } from "effect";
import { useLocale } from "gt-tanstack-start";
import { useAtomValue } from "@effect/atom-react";
import {
  runSessionBestRunScoreAtom,
  runSessionBestStreakAtom,
  runSessionCreatedAtAtom,
  runSessionRunIdAtom,
  runSessionRunScoreAtom,
  runSessionStreakAtom,
  runResultAtom,
} from "@/features/game/state/run-session";
import { formatDuration } from "@/domain/formatters";

// components
import { T } from "gt-react";
import { RunStat } from "./run-stat";

// assets
import { ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// types
interface RunDurationSectionProps {
  createdAt: Option.Option<DateTime.DateTime>;
  finishedAt: Option.Option<DateTime.DateTime>;
  isLive: boolean;
}

export function RunScore() {
  const runResult = useAtomValue(runResultAtom);
  const activeRunId = useAtomValue(runSessionRunIdAtom);
  const activeCreatedAt = useAtomValue(runSessionCreatedAtAtom);
  const activeRunScore = useAtomValue(runSessionRunScoreAtom);
  const activeStreak = useAtomValue(runSessionStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);
  const locale = useLocale();

  const summary = Option.match(runResult, {
    onSome: ({ createdAt, finishedAt, runScore, streak }) =>
      Option.some({ createdAt: Option.some(createdAt), finishedAt: Option.some(finishedAt), runScore, streak, isLive: false }),
    onNone: () =>
      Option.map(activeRunId, () => ({
        createdAt: activeCreatedAt,
        finishedAt: Option.none<DateTime.DateTime>(),
        runScore: activeRunScore,
        streak: activeStreak,
        isLive: true,
      })),
  });

  return Option.match(summary, {
    onNone: () => null,
    onSome: ({ createdAt, finishedAt, runScore, streak, isLive }) => (
      <section className="grid grid-cols-2 grid-rows-2 border">
        <RunDurationSection createdAt={createdAt} finishedAt={finishedAt} isLive={isLive} />
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
    ),
  });
}

// The 1 Hz clock is isolated here instead of living in `RunScore`: a live run
// re-renders only this section every second, not the whole stat grid. The effect
// depends on the derived `isLive` boolean alone, so the interval is created once
// per run lifecycle instead of being torn down and recreated whenever an Option
// atom re-emits a fresh identity (rerender-dependencies / rerender-derived-state)
function RunDurationSection({ createdAt, finishedAt, isLive }: RunDurationSectionProps) {
  // Freeze the clock when the run already finished (the section then shows the
  // final result, not a live timer)
  const [now, setNow] = useState(() => DateTime.makeUnsafe(Date.now()));

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setNow(DateTime.makeUnsafe(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // NOTE: React state initializer + interval callback are synchronous contexts —
  // `DateTime.now` (an Effect) and `Schedule` are unavailable here. `Date.now()`
  // with the canonical `useEffect` cleanup above is the idiomatic React pattern

  // A live run ends "now" (ticking); a finished run freezes at its recorded end
  const runFinishedAt = isLive ? now : Option.getOrElse(finishedAt, () => now);
  const runStartedAt = Option.getOrElse(createdAt, () => runFinishedAt);

  // We calculate the total real-world time the run was alive
  const runDuration = DateTime.distance(runStartedAt, runFinishedAt);

  return (
    <div className="col-span-2 p-3">
      <h3 className="max-w-none font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Run Duration</T>
      </h3>
      <div className="flex items-center justify-center gap-1">
        <ClockIcon className="size-9" />
        <span className="font-sans text-4xl font-semibold wrap-anywhere tabular-nums">{formatDuration(runDuration)}</span>
      </div>
    </div>
  );
}
