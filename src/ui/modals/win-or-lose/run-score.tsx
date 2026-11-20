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
import { RunStatCell } from "./run-stat";
import { RunDurationSection } from "./run-duration";

// What the stat grid reports: the run's two figures, plus the timestamps its
// duration is measured from. A finished run has both ends; a live one only has a
// start, which is why the timestamps are `Option`s rather than plain values
interface RunScoreSummary {
  createdAt: Option.Option<DateTime.DateTime>;
  finishedAt: Option.Option<DateTime.DateTime>;
  runScore: number;
  streak: number;
}

// Derives the run-score summary from raw atom values; keeps the domain
// derivation (finished vs. live run, which timestamps to show) out of the
// render function so the component only handles presentation
function buildRunScoreSummary(
  runResult: Option.Option<{ createdAt: DateTime.DateTime; finishedAt: DateTime.DateTime; runScore: number; streak: number }>,
  activeRunId: Option.Option<string>,
  activeCreatedAt: Option.Option<DateTime.DateTime>,
  activeRunScore: number,
  activeStreak: number
): Option.Option<RunScoreSummary> {
  return Option.match(runResult, {
    onSome: ({ createdAt, finishedAt, runScore, streak }) =>
      Option.some({ createdAt: Option.some(createdAt), finishedAt: Option.some(finishedAt), runScore, streak }),
    onNone: () =>
      Option.map(activeRunId, () => ({
        createdAt: activeCreatedAt,
        finishedAt: Option.none<DateTime.DateTime>(),
        runScore: activeRunScore,
        streak: activeStreak,
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

  // Early return: with neither a finished run nor an active one there is nothing
  // to report. Returning before the markup keeps the stat grid below at one
  // indentation level instead of nesting it inside a match callback
  if (Option.isNone(summary)) return null;

  const { createdAt, finishedAt, runScore, streak } = summary.value;

  return (
    <section className="grid grid-cols-2 grid-rows-2 border">
      <RunDurationSection createdAt={createdAt} finishedAt={finishedAt} />
      <RunStatCell label={<T>Run Score</T>} surface="surface-2" tone="score">
        {runScore.toLocaleString(locale)}
      </RunStatCell>
      <RunStatCell label={<T>Streak</T>} surface="surface-3" tone="streak">
        {streak.toLocaleString(locale)}
      </RunStatCell>
      <RunStatCell label={<T>Best Run Score</T>} surface="surface-3" tone="score">
        {bestRunScore.toLocaleString(locale)}
      </RunStatCell>
      <RunStatCell label={<T>Best Streak</T>} surface="surface-2" tone="streak">
        {bestStreak.toLocaleString(locale)}
      </RunStatCell>
    </section>
  );
}
