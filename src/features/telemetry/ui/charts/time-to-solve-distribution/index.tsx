"use client";

// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getTimeToSolveDistributionsAction } from "@/features/telemetry/state";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TimeToSolveDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// Maps your exact exponential boundaries to friendly display ranges
const formatSecondsTick = (maxSeconds: number | null) => {
  if (maxSeconds === 5) return "0-5s";
  if (maxSeconds === 10) return "6-10s";
  if (maxSeconds === 20) return "11-20s";
  if (maxSeconds === 40) return "21-40s";
  if (maxSeconds === 80) return "41-80s";
  if (maxSeconds === 160) return "81-160s";
  if (maxSeconds === 320) return "161-320s";
  if (maxSeconds === 640) return "321-640s";
  if (maxSeconds === null) return "640+s";
  return "";
};

export function TimeToSolveDistributionChart({ solutionsLanguage }: TimeToSolveDistributionChartProps) {
  const [getTimeToSolveDistributionsResult, getTimeToSolveDistributions] = useAtom(getTimeToSolveDistributionsAction);

  useEffect(() => {
    getTimeToSolveDistributions();
  }, [getTimeToSolveDistributions]);

  return AsyncResult.builder(getTimeToSolveDistributionsResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((timeToSolveDistributionsData) => {
      const timeToSolveDistributionData = timeToSolveDistributionsData[solutionsLanguage === "En" ? 0 : 1];

      return timeToSolveDistributionData.length === 0 ? (
        <InfoLine message="No Guesses yet!" />
      ) : (
        <BarChart data={timeToSolveDistributionData} responsive className="h-96 w-full">
          <CartesianGrid stroke="var(--color-surface-3)" />

          <XAxis dataKey="maxSeconds" tickFormatter={formatSecondsTick} stroke="var(--color-text-1)" />
          <YAxis tickFormatter={(tick) => `${tick}%`} stroke="var(--color-text-1)" />

          <Tooltip
            formatter={(value, name) => [`${value}%`, name === "personalPct" ? "Your Speed" : "Global Average"]}
            labelFormatter={(label) => `Time: ${formatSecondsTick(label as number | null)}`}
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
            labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
            itemStyle={{ color: "var(--color-text-2)" }}
          />
          <Legend
            formatter={(value) => (value === "personalPct" ? "Your Speed" : "Global Average")}
            labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
          />

          <Bar dataKey="globalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    })
    .render();
}
