// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { msg, useGT, useMessages } from "gt-next";
import { timeToSolveDistributionAtom } from "@/features/telemetry/state";
import { XAxis } from "recharts";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/domain";

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
    (value: unknown, name: unknown) => [`${String(value)}%`, name === "personalPct" ? gt("Your Speed") : gt("Global Average")] as const,
    [gt]
  );
  const tooltipLabelFormatter = useCallback((label: unknown) => formatSpeedCategory(label as number | null), [formatSpeedCategory]);
  const legendFormatter = useCallback((value: unknown) => (value === "personalPct" ? gt("Your Speed") : gt("Global Average")), [gt]);

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
