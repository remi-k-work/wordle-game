// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { failedWordsFrequencyAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface FailedWordsFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

export function FailedWordsFrequencyChart({ solutionsLanguage }: FailedWordsFrequencyChartProps) {
  const failedWordsFrequency = useAtomValue(failedWordsFrequencyAtom(solutionsLanguage));

  return AsyncResult.builder(failedWordsFrequency)
    .onInitialOrWaiting(() => <FailedWordsFrequencyChartSkeleton />)
    .onFailure(() => <FailedWordsFrequencyChartSkeleton />)
    .onSuccess((failedWordsFrequency) =>
      failedWordsFrequency.length === 0 ? (
        <>
          <SectionHeader title="Words that players failed to guess" />
          <InfoLine message="No frequency data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title="Words that players failed to guess" />
          <BarChart
            data={failedWordsFrequency}
            responsive
            layout="vertical"
            className="w-full **:outline-none **:select-none"
            style={{ height: `${CHART_PADDING_PX + failedWordsFrequency.length * BAR_HEIGHT_PX}px` }}
          >
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis type="number" stroke="var(--color-text-1)" />
            <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

            <Tooltip
              formatter={(value, name) => [`${value}`, name === "personal" ? "Your Misses" : "Global Misses"]}
              labelFormatter={(label) => `${label}`}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personal" ? "Your Misses" : "Global Misses")}
              labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
            />

            <Bar dataKey="personal" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />
            <Bar dataKey="global" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />
          </BarChart>
        </>
      )
    )
    .render();
}

export function FailedWordsFrequencyChartSkeleton() {
  return (
    <>
      <SectionHeaderSkeleton title="Words that players failed to guess" />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
