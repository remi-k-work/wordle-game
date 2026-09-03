// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { failedWordsFrequencyAtom } from "@/features/telemetry/state";
import { XAxis, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";

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
  const gt = useGT();

  return AsyncResult.builder(failedWordsFrequency)
    .onInitialOrWaiting(() => <FailedWordsFrequencyChartSkeleton />)
    .onFailure(() => <FailedWordsFrequencyChartSkeleton />)
    .onSuccess((failedWordsFrequency) =>
      failedWordsFrequency.length === 0 ? (
        <>
          <SectionHeader title={gt("Words that players failed to guess")} />
          <InfoLine message={gt("No frequency data tracked yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("Words that players failed to guess")} />
          <BarChart
            data={failedWordsFrequency}
            responsive
            layout="vertical"
            className="w-full **:outline-none **:select-none"
            style={{ height: `${CHART_PADDING_PX + failedWordsFrequency.length * BAR_HEIGHT_PX}px` }}
          >
            <ChartGrid />

            <XAxis type="number" stroke="var(--color-text-1)" />
            <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

            <ChartTooltip
              formatter={(value, name) => [`${value}`, name === "personal" ? gt("Your Misses") : gt("Global Misses")]}
              labelFormatter={(label) => `${label}`}
            />
            <ChartLegend formatter={(value) => (value === "personal" ? gt("Your Misses") : gt("Global Misses"))} />

            <PersonalBar />
            <GlobalBar />
          </BarChart>
        </>
      )
    )
    .render();
}

export function FailedWordsFrequencyChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Words that players failed to guess")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
