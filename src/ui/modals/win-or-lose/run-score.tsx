// services, features, and other libraries
import { DateTime, Option } from "effect";
import { T } from "gt-react";
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

// components
import { RunStat } from "./run-stat";
import { RunDurationSection } from "./run-duration";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// Derives the run-score summary from raw atom values; keeps the domain
// derivation (finished vs. live run, which timestamps to show) out of the
// render function so the component only handles presentation
function buildRunScoreSummary(
  runResult: Option.Option<{ createdAt: DateTime.DateTime; finishedAt: DateTime.DateTime; runScore: number; streak: number }>,
  activeRunId: Option.Option<string>,
  activeCreatedAt: Option.Option<DateTime.DateTime>,
  activeRunScore: number,
  activeStreak: number
): Option.Option<{
  createdAt: Option.Option<DateTime.DateTime>;
  finishedAt: Option.Option<DateTime.DateTime>;
  runScore: number;
  streak: number;
  isLive: boolean;
}> {
  return Option.match(runResult, {
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

  const summary = buildRunScoreSummary(runResult, activeRunId, activeCreatedAt, activeRunScore, activeStreak);

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
