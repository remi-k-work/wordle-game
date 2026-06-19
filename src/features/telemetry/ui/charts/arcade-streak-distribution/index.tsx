// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getArcadeStreakDistributionsAction } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface ArcadeStreakDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function ArcadeStreakDistributionChart({ solutionsLanguage }: ArcadeStreakDistributionChartProps) {
  const [getArcadeStreakDistributionsResult, getArcadeStreakDistributions] = useAtom(getArcadeStreakDistributionsAction);

  useEffect(() => {
    getArcadeStreakDistributions();
  }, [getArcadeStreakDistributions]);

  return AsyncResult.builder(getArcadeStreakDistributionsResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((arcadeStreakDistributionsData) => {
      const arcadeStreakDistributionData = arcadeStreakDistributionsData[solutionsLanguage === "En" ? 0 : 1].map((row) => ({
        ...row,
        streak: row.streak === null ? Infinity : row.streak,
      }));

      return arcadeStreakDistributionData.length === 0 ? (
        <InfoLine message="No streak data tracked yet!" />
      ) : (
        <ComposedChart data={arcadeStreakDistributionData} responsive className="h-96 w-full **:outline-none **:select-none">
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

          <Line type="monotone" dataKey="globalPct" stroke="var(--color-accent)" strokeWidth={4} />
          <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[9, 9, 0, 0]} />
        </ComposedChart>
      );
    })
    .render();
}
