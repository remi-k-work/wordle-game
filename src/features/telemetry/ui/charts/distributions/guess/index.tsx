// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { guessDistributionAtom } from "@/features/telemetry/state";
import { XAxis, ComposedChart } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistribution = useAtomValue(guessDistributionAtom(solutionsLanguage));
  const gt = useGT();

  return AsyncResult.builder(guessDistribution)
    .onInitialOrWaiting(() => <GuessDistributionChartSkeleton />)
    .onFailure(() => <GuessDistributionChartSkeleton />)
    .onSuccess((guessDistribution) =>
      guessDistribution.length === 0 ? (
        <>
          <SectionHeader title={gt("Guesses needed to win a game")} />
          <InfoLine message={gt("No Guesses yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("Guesses needed to win a game")} />
          <ComposedChart data={guessDistribution} responsive className="h-96 w-full **:outline-none **:select-none lg:h-192">
            <ChartGrid />

            <XAxis dataKey="turn" tickFormatter={(tick) => gt("Turn {turn}", { turn: tick })} stroke="var(--color-text-1)" />

            <ChartTooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? gt("Your Guesses") : gt("Global Average")]}
              labelFormatter={(label) => gt("Turn: {turn}", { turn: label })}
            />
            <ChartLegend formatter={(value) => (value === "personalPct" ? gt("Your Guesses") : gt("Global Average"))} />

            <PersonalPctBar />
            <GlobalPctLine />
          </ComposedChart>
        </>
      )
    )
    .render();
}

export function GuessDistributionChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Guesses needed to win a game")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
