// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { openingGuessesFrequencyAtom } from "@/features/telemetry/state";
import { XAxis, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

export function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const openingGuessesFrequency = useAtomValue(openingGuessesFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  return AsyncResult.builder(openingGuessesFrequency)
    .onInitialOrWaiting(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onFailure(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onSuccess((openingGuessesFrequency) =>
      openingGuessesFrequency.length === 0 ? (
        <>
          <SectionHeader title={gt("First word guessed in a game")} />
          <InfoLine message={gt("No frequency data tracked yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("First word guessed in a game")} />
          <BarChart
            data={openingGuessesFrequency}
            responsive
            layout="vertical"
            className="w-full **:outline-none **:select-none"
            style={{ height: `${CHART_PADDING_PX + openingGuessesFrequency.length * BAR_HEIGHT_PX}px` }}
          >
            <ChartGrid />

            <XAxis type="number" stroke="var(--color-text-1)" />
            <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

            <ChartTooltip
              formatter={(value, name) => [`${value}`, name === "personal" ? gt("Your Guesses") : gt("Global Guesses")]}
              labelFormatter={(label) => `${label}`}
            />
            <ChartLegend formatter={(value) => (value === "personal" ? gt("Your Guesses") : gt("Global Guesses"))} />

            <PersonalBar />
            <GlobalBar />
          </BarChart>
        </>
      )
    )
    .render();
}

export function OpeningGuessesFrequencyChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("First word guessed in a game")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
