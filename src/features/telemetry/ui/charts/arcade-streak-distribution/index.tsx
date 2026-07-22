// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { arcadeStreakDistributionAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const arcadeStreakDistribution = useAtomValue(arcadeStreakDistributionAtom(solutionsLanguage));

  return AsyncResult.builder(arcadeStreakDistribution)
    .onInitialOrWaiting(() => <ArcadeStreakDistributionChartSkeleton />)
    .onFailure(() => <ArcadeStreakDistributionChartSkeleton />)
    .onSuccess((arcadeStreakDistribution) =>
      arcadeStreakDistribution.length === 0 ? (
        <>
          <SectionHeader title="Distribution of run lengths (streak) before a loss" />
          <InfoLine message="No streak data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title="Distribution of run lengths (streak) before a loss" />
          <ComposedChart data={arcadeStreakDistribution} responsive className="h-96 w-full **:outline-none **:select-none">
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis dataKey="streak" tickFormatter={(tick) => (tick === Infinity ? "14+" : `${tick}`)} stroke="var(--color-text-1)" />

            <Tooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? "Your Streak" : "Global Average"]}
              labelFormatter={(label) => (label === Infinity ? "Streak: 14+" : `Streak: ${label}`)}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personalPct" ? "Your Streak" : "Global Average")}
              labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
            />

            <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[9, 9, 0, 0]} />
            <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />
          </ComposedChart>
        </>
      )
    )
    .render();
}

export function ArcadeStreakDistributionChartSkeleton() {
  return (
    <>
      <SectionHeader title="Distribution of run lengths (streak) before a loss" />
      <div className="h-96 w-full animate-pulse bg-accent" />
    </>
  );
}
