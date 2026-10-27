// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react";
import { arcadeStreakDistributionAtom } from "@/features/telemetry/state/charts";
import { XAxis } from "recharts";

// components
import { DistributionEmpty } from "@/features/telemetry/ui/charts/distribution-shell";
import { DistributionChart } from "@/features/telemetry/ui/charts/distribution-chart";
import { ArcadeStreakDistributionChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const arcadeStreakDistribution = useAtomValue(arcadeStreakDistributionAtom(solutionsLanguage));
  const gt = useGT();

  const tickFormatter = (tick: number) => (tick === Infinity ? "14+" : `${tick}`);
  const tooltipFormatter = (value: unknown, name: unknown) => [`${String(value)}%`, name === "personalPct" ? gt("Your Streak") : gt("Global Average")] as const;
  const tooltipLabelFormatter = (label: unknown) => (label === Infinity ? "Streak: 14+" : `Streak: ${String(label)}`);
  const legendFormatter = (value: unknown) => (value === "personalPct" ? gt("Your Streak") : gt("Global Average"));

  return AsyncResult.builder(arcadeStreakDistribution)
    .onInitialOrWaiting(() => <ArcadeStreakDistributionChartSkeleton />)
    .onFailure(() => <ArcadeStreakDistributionChartSkeleton />)
    .onSuccess((arcadeStreakDistribution) =>
      arcadeStreakDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Streak before a loss")} message={gt("No streak data tracked yet!")} />
      ) : (
        <DistributionChart
          title={gt("Streak before a loss")}
          data={arcadeStreakDistribution}
          xAxis={<XAxis dataKey="streak" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />}
          tooltipFormatter={tooltipFormatter}
          tooltipLabelFormatter={tooltipLabelFormatter}
          legendFormatter={legendFormatter}
        />
      )
    )
    .render();
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { ArcadeStreakDistributionChartSkeleton };
