// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { failedWordsFrequencyAtom } from "@/features/telemetry/state";
import { XAxis, YAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarEmpty, HorizontalBarFrame, HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface FailedWordsFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function FailedWordsFrequencyChart({ solutionsLanguage }: FailedWordsFrequencyChartProps) {
  const failedWordsFrequency = useAtomValue(failedWordsFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const tooltipFormatter = useCallback(
    (value: unknown, name: unknown) => [`${String(value)}`, name === "personal" ? gt("Your Misses") : gt("Global Misses")] as const,
    [gt]
  );
  const tooltipLabelFormatter = useCallback((label: unknown) => String(label), []);
  const legendFormatter = useCallback((value: unknown) => (value === "personal" ? gt("Your Misses") : gt("Global Misses")), [gt]);

  return AsyncResult.builder(failedWordsFrequency)
    .onInitialOrWaiting(() => <FailedWordsFrequencyChartSkeleton />)
    .onFailure(() => <FailedWordsFrequencyChartSkeleton />)
    .onSuccess((failedWordsFrequency) =>
      failedWordsFrequency.length === 0 ? (
        <HorizontalBarEmpty title={gt("Words that players failed to guess")} message={gt("No frequency data tracked yet!")} />
      ) : (
        <HorizontalBarFrame title={gt("Words that players failed to guess")} data={failedWordsFrequency}>
          <ChartGrid />

          <XAxis type="number" stroke="var(--color-text-1)" />
          <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalBar />
          <GlobalBar />
        </HorizontalBarFrame>
      )
    )
    .render();
}

export function FailedWordsFrequencyChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("Words that players failed to guess")} />;
}
