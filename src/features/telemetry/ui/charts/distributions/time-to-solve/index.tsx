// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { msg, useGT, useMessages } from "gt-next";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/ui/speed-multiplier-category";
import { timeToSolveDistributionAtom } from "@/features/telemetry/state";
import { XAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";
import { DistributionEmpty, DistributionFrame, DistributionSkeleton } from "@/features/telemetry/ui/charts/distribution-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TimeToSolveDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TimeToSolveDistributionChart({ solutionsLanguage }: TimeToSolveDistributionChartProps) {
  const timeToSolveDistribution = useAtomValue(timeToSolveDistributionAtom(solutionsLanguage));
  const gt = useGT();
  const messages = useMessages();
  const formatSpeedCategory = useCallback(
    (maxSeconds: number | null, emojiOnly: boolean = false) => {
      const speedMultiplier = maxSecondsToSpeedMultiplier(maxSeconds);
      if (speedMultiplier === undefined) return emojiOnly ? "?" : messages(msg("Unknown"));

      return emojiOnly ? speedMultiplierToCategoryEmoji(speedMultiplier) : messages(speedMultiplierToCategoryMessage(speedMultiplier));
    },
    [messages]
  );
  const tickFormatter = useCallback((tick: number | null) => formatSpeedCategory(tick, true), [formatSpeedCategory]);
  const tooltipFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, name: any) => [`${value}%`, name === "personalPct" ? gt("Your Speed") : gt("Global Average")] as const,
    [gt]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipLabelFormatter = useCallback((label: any) => formatSpeedCategory(label as number | null), [formatSpeedCategory]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendFormatter = useCallback((value: any) => (value === "personalPct" ? gt("Your Speed") : gt("Global Average")), [gt]);

  return AsyncResult.builder(timeToSolveDistribution)
    .onInitialOrWaiting(() => <TimeToSolveDistributionChartSkeleton />)
    .onFailure(() => <TimeToSolveDistributionChartSkeleton />)
    .onSuccess((timeToSolveDistribution) =>
      timeToSolveDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Time taken to solve a word")} message={gt("No speed data tracked yet!")} />
      ) : (
        <DistributionFrame title={gt("Time taken to solve a word")} data={timeToSolveDistribution}>
          <ChartGrid />

          <XAxis dataKey="maxSeconds" tickFormatter={tickFormatter} stroke="var(--color-text-1)" fontSize={32} />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalPctBar />
          <GlobalPctLine />
        </DistributionFrame>
      )
    )
    .render();
}

export function TimeToSolveDistributionChartSkeleton() {
  const gt = useGT();

  return <DistributionSkeleton title={gt("Time taken to solve a word")} />;
}
