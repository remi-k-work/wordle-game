// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { arcadeStreakDistributionAtom } from "@/features/telemetry/state";
import { XAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";
import { DistributionEmpty, DistributionFrame, DistributionSkeleton } from "@/features/telemetry/ui/charts/distribution-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const arcadeStreakDistribution = useAtomValue(arcadeStreakDistributionAtom(solutionsLanguage));
  const gt = useGT();

  const tickFormatter = useCallback((tick: number) => (tick === Infinity ? "14+" : `${tick}`), []);
  const tooltipFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, name: any) => [`${value}%`, name === "personalPct" ? gt("Your Streak") : gt("Global Average")] as const,
    [gt]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipLabelFormatter = useCallback((label: any) => (label === Infinity ? "Streak: 14+" : `Streak: ${label}`), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendFormatter = useCallback((value: any) => (value === "personalPct" ? gt("Your Streak") : gt("Global Average")), [gt]);

  return AsyncResult.builder(arcadeStreakDistribution)
    .onInitialOrWaiting(() => <ArcadeStreakDistributionChartSkeleton />)
    .onFailure(() => <ArcadeStreakDistributionChartSkeleton />)
    .onSuccess((arcadeStreakDistribution) =>
      arcadeStreakDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Streak before a loss")} message={gt("No streak data tracked yet!")} />
      ) : (
        <DistributionFrame title={gt("Streak before a loss")} data={arcadeStreakDistribution}>
          <ChartGrid />

          <XAxis dataKey="streak" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalPctBar />
          <GlobalPctLine />
        </DistributionFrame>
      )
    )
    .render();
}

export function ArcadeStreakDistributionChartSkeleton() {
  const gt = useGT();

  return <DistributionSkeleton title={gt("Streak before a loss")} />;
}
