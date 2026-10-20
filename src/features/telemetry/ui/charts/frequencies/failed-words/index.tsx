// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-tanstack-start";
import { failedWordsFrequencyAtom } from "@/features/telemetry/state/charts";
import { XAxis, YAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarEmpty, HorizontalBarFrame } from "@/features/telemetry/ui/charts/horizontal-bar-shell";
import { FailedWordsFrequencyChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

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

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { FailedWordsFrequencyChartSkeleton };
