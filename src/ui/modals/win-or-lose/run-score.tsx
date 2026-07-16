// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import { DateTime, Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import {
  runSessionBestRunScoreAtom,
  runSessionBestStreakAtom,
  runSessionCreatedAtAtom,
  runSessionRunIdAtom,
  runSessionRunScoreAtom,
  runSessionStreakAtom,
} from "@/features/game/state";
import { formatDuration } from "@/features/game/domain";

// assets
import { ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function RunScore() {
  const runId = useAtomValue(runSessionRunIdAtom);
  const createdAt = useAtomValue(runSessionCreatedAtAtom);
  const runScore = useAtomValue(runSessionRunScoreAtom);
  const streak = useAtomValue(runSessionStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);

  // We calculate the total real-world time the run was alive
  const [now, setNow] = useState(() => DateTime.makeUnsafe(Date.now()));
  const runDuration = DateTime.distance(
    Option.getOrElse(createdAt, () => now),
    now
  );

  useEffect(() => {
    // If we do not have an active run, time freezes
    if (Option.isNone(runId)) return;

    const interval = setInterval(() => {
      setNow(DateTime.makeUnsafe(Date.now()));
    }, 1000);

    return () => interval && clearInterval(interval);
  }, [runId]);

  return (
    <section className="grid grid-cols-2 grid-rows-2 border">
      <div className="col-span-2 p-3">
        <h3 className="max-w-none font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Duration</h3>
        <div className="flex items-center justify-center gap-1">
          <ClockIcon className="size-9" />
          <span className="font-sans text-4xl font-semibold wrap-anywhere tabular-nums">{formatDuration(runDuration)}</span>
        </div>
      </div>
      <div className="bg-surface-2 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Score</h3>
        <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-accent">
          <TrophyIcon className="size-7" />
          {runScore}
        </span>
      </div>
      <div className="bg-surface-3 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Streak</h3>
        <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-destructive">
          <FireIcon className="size-7" />
          {streak}
        </span>
      </div>
      <div className="bg-surface-3 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Best Run Score</h3>
        <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-accent">
          <TrophyIcon className="size-7" />
          {bestRunScore}
        </span>
      </div>
      <div className="bg-surface-2 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Best Streak</h3>
        <span className="flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere text-destructive">
          <FireIcon className="size-7" />
          {bestStreak}
        </span>
      </div>
    </section>
  );
}
