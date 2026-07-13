// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { timeToSolveDistributionsAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TimeToSolveDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// A quick helper to map our boundaries to game speed labels
const formatSpeedCategory = (maxSeconds: number | null, emojiOnly: boolean = false) => {
  if (maxSeconds === 30) return emojiOnly ? "🚀" : "🚀 Speed Demon";
  if (maxSeconds === 60) return emojiOnly ? "⚡" : "⚡ Quick Thinker";
  if (maxSeconds === 180) return emojiOnly ? "⏱️" : "⏱️ Average Pacer";
  if (maxSeconds === Infinity) return emojiOnly ? "🐌" : "🐌 Slow Learner";
  return emojiOnly ? "?" : "Unknown";
};

function TimeToSolveDistributionChart({ solutionsLanguage }: TimeToSolveDistributionChartProps) {
  const timeToSolveDistributions = useAtomValue(timeToSolveDistributionsAtom);

  return AsyncResult.builder(timeToSolveDistributions)
    .onInitialOrWaiting(() => <TimeToSolveDistributionChartSkeleton />)
    .onFailure(() => <TimeToSolveDistributionChartSkeleton />)
    .onSuccess((timeToSolveDistributionsData) => {
      const timeToSolveDistributionData = timeToSolveDistributionsData[solutionsLanguage === "En" ? 0 : 1].map((row) => ({
        ...row,
        maxSeconds: row.maxSeconds === null ? Infinity : row.maxSeconds,
      }));

      return timeToSolveDistributionData.length === 0 ? (
        <InfoLine message="No speed data tracked yet!" />
      ) : (
        <ComposedChart data={timeToSolveDistributionData} responsive className="h-96 w-full **:outline-none **:select-none">
          <CartesianGrid stroke="var(--color-surface-3)" />

          <XAxis dataKey="maxSeconds" tickFormatter={(tick) => formatSpeedCategory(tick, true)} stroke="var(--color-text-1)" fontSize={32} />

          <Tooltip
            formatter={(value, name) => [`${value}%`, name === "personalPct" ? "Your Speed" : "Global Average"]}
            labelFormatter={(label) => formatSpeedCategory(label as number | null)}
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
            labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
            itemStyle={{ color: "var(--color-text-2)" }}
          />
          <Legend
            formatter={(value) => (value === "personalPct" ? "Your Speed" : "Global Average")}
            labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
          />

          <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[9, 9, 0, 0]} />
          <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />
        </ComposedChart>
      );
    })
    .render();
}

function TimeToSolveDistributionChartSkeleton() {
  return <div className="h-96 w-full animate-pulse bg-accent" />;
}

export function TimeToSolveDistributionCharts() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of time taken to solve a word
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <TimeToSolveDistributionChart solutionsLanguage="En" />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of time taken to solve a word
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <TimeToSolveDistributionChart solutionsLanguage="Pl" />
      </div>
    </section>
  );
}

export function TimeToSolveDistributionChartsSkeleton() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of time taken to solve a word
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <TimeToSolveDistributionChartSkeleton />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of time taken to solve a word
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <TimeToSolveDistributionChartSkeleton />
      </div>
    </section>
  );
}
