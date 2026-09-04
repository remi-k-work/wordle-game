// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { openingGuessesFrequencyAtom } from "@/features/telemetry/state";
import { XAxis, YAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarEmpty, HorizontalBarFrame, HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const openingGuessesFrequency = useAtomValue(openingGuessesFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const tooltipFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, name: any) => [`${value}`, name === "personal" ? gt("Your Guesses") : gt("Global Guesses")] as const,
    [gt]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipLabelFormatter = useCallback((label: any) => `${label}`, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendFormatter = useCallback((value: any) => (value === "personal" ? gt("Your Guesses") : gt("Global Guesses")), [gt]);

  return AsyncResult.builder(openingGuessesFrequency)
    .onInitialOrWaiting(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onFailure(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onSuccess((openingGuessesFrequency) =>
      openingGuessesFrequency.length === 0 ? (
        <HorizontalBarEmpty title={gt("First word guessed in a game")} message={gt("No frequency data tracked yet!")} />
      ) : (
        <HorizontalBarFrame title={gt("First word guessed in a game")} data={openingGuessesFrequency}>
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

export function OpeningGuessesFrequencyChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("First word guessed in a game")} />;
}
