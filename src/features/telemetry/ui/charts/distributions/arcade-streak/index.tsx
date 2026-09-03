// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { arcadeStreakDistributionAtom } from "@/features/telemetry/state";
import { XAxis, ComposedChart } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const arcadeStreakDistribution = useAtomValue(arcadeStreakDistributionAtom(solutionsLanguage));
  const gt = useGT();

  return AsyncResult.builder(arcadeStreakDistribution)
    .onInitialOrWaiting(() => <ArcadeStreakDistributionChartSkeleton />)
    .onFailure(() => <ArcadeStreakDistributionChartSkeleton />)
    .onSuccess((arcadeStreakDistribution) =>
      arcadeStreakDistribution.length === 0 ? (
        <>
          <SectionHeader title={gt("Streak before a loss")} />
          <InfoLine message={gt("No streak data tracked yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("Streak before a loss")} />
          <ComposedChart data={arcadeStreakDistribution} responsive className="h-96 w-full **:outline-none **:select-none lg:h-192">
            <ChartGrid />

            <XAxis dataKey="streak" tickFormatter={(tick) => (tick === Infinity ? "14+" : `${tick}`)} stroke="var(--color-text-1)" />

            <ChartTooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? gt("Your Streak") : gt("Global Average")]}
              labelFormatter={(label) => (label === Infinity ? "Streak: 14+" : `Streak: ${label}`)}
            />
            <ChartLegend formatter={(value) => (value === "personalPct" ? gt("Your Streak") : gt("Global Average"))} />

            <PersonalPctBar />
            <GlobalPctLine />
          </ComposedChart>
        </>
      )
    )
    .render();
}

export function ArcadeStreakDistributionChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Streak before a loss")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
