// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { useGT } from "gt-react";
import { arcadeStreakDistributionAtom } from "@/features/charts/state/charts";
import { XAxis } from "recharts";
import { formatPercent, makeSeriesLabels } from "@/features/charts/ui/chart-series";

// components
import { ChartSection } from "@/features/charts/ui/chart-section";
import { DistributionChart } from "@/features/charts/ui/distribution-chart";
import { ArcadeStreakDistributionChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const arcadeStreakDistribution = useAtomValue(arcadeStreakDistributionAtom(solutionsLanguage));
  const gt = useGT();

  const seriesLabels = makeSeriesLabels({ personalKey: "personalPct", personal: gt("Your Streak"), global: gt("Global Average"), formatValue: formatPercent });

  // An unbounded bucket reads as "14+": the cap the archive keeps after which every longer streak lands in the same row as the unbounded one
  const tickFormatter = (tick: number) => (tick === Infinity ? "14+" : `${tick}`);
  const tooltipLabelFormatter = (label: unknown) => (label === Infinity ? "Streak: 14+" : `Streak: ${String(label)}`);

  // Both the empty state and the chart carry the same heading, so it is resolved once here instead of being re-translated in each branch
  const title = gt("Streak before a loss");

  return (
    <ChartSection
      title={title}
      result={arcadeStreakDistribution}
      skeleton={<ArcadeStreakDistributionChartSkeleton />}
      emptyMessage={gt("No streak data tracked yet!")}
    >
      {(rows) => (
        <DistributionChart
          title={title}
          data={rows}
          xAxis={<XAxis dataKey="streak" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />}
          tooltipFormatter={seriesLabels.tooltipFormatter}
          tooltipLabelFormatter={tooltipLabelFormatter}
          legendFormatter={seriesLabels.legendFormatter}
        />
      )}
    </ChartSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { ArcadeStreakDistributionChartSkeleton };
