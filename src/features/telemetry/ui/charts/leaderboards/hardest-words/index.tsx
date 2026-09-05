// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { hardestWordsLeaderboardAtom } from "@/features/telemetry/state";
import { XAxis, YAxis } from "recharts";
import { formatSeconds } from "@/lib/formatters";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarEmpty, HorizontalBarFrame, HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface HardestWordsLeaderboardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function HardestWordsLeaderboardChart({ solutionsLanguage }: HardestWordsLeaderboardChartProps) {
  const hardestWordsLeaderboard = useAtomValue(hardestWordsLeaderboardAtom(solutionsLanguage));
  const gt = useGT();

  const tickFormatter = useCallback((value: number) => formatSeconds(value), []);
  const tooltipFormatter = useCallback(
    (value: unknown, name: unknown) =>
      [formatSeconds(Number(value)), name === "personalAvgTimeSeconds" ? gt("Your Average Time") : gt("Global Average Time")] as const,
    [gt]
  );
  const tooltipLabelFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (label: unknown, payload: any) => {
      const row = payload?.[0]?.payload;
      return (
        <>
          {label}
          <br />
          <span className="font-mono font-normal">{gt("Global Average Guesses: {count}", { count: row?.globalAvgGuesses?.toFixed(1) ?? "—" })}</span>
          <br />
          <span className="font-mono font-normal">{gt("Your Average Guesses: {count}", { count: row?.personalAvgGuesses?.toFixed(1) ?? "—" })}</span>
        </>
      );
    },
    [gt]
  );
  const legendFormatter = useCallback((value: unknown) => (value === "personalAvgTimeSeconds" ? gt("Your Average Time") : gt("Global Average Time")), [gt]);

  return AsyncResult.builder(hardestWordsLeaderboard)
    .onInitialOrWaiting(() => <HardestWordsLeaderboardChartSkeleton />)
    .onFailure(() => <HardestWordsLeaderboardChartSkeleton />)
    .onSuccess((hardestWordsLeaderboard) =>
      hardestWordsLeaderboard.length === 0 ? (
        <HorizontalBarEmpty title={gt("Hardest words by average solve time")} message={gt("No leaderboard data tracked yet!")} />
      ) : (
        <HorizontalBarFrame title={gt("Hardest words by average solve time")} data={hardestWordsLeaderboard}>
          <ChartGrid />

          <XAxis type="number" stroke="var(--color-text-1)" tickFormatter={tickFormatter} />
          <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalBar dataKey="personalAvgTimeSeconds" />
          <GlobalBar dataKey="globalAvgTimeSeconds" />
        </HorizontalBarFrame>
      )
    )
    .render();
}

export function HardestWordsLeaderboardChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("Hardest words by average solve time")} />;
}
