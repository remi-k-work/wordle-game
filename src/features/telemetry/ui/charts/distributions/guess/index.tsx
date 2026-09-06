// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { guessDistributionAtom } from "@/features/telemetry/state";
import { XAxis } from "recharts";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";
import { DistributionEmpty, DistributionFrame, DistributionSkeleton } from "@/features/telemetry/ui/charts/distribution-shell";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistribution = useAtomValue(guessDistributionAtom(solutionsLanguage));
  const gt = useGT();

  const tickFormatter = useCallback((tick: number) => gt("Turn {turn}", { turn: tick }), [gt]);
  const tooltipFormatter = useCallback(
    (value: unknown, name: unknown) => [`${String(value)}%`, name === "personalPct" ? gt("Your Guesses") : gt("Global Average")] as const,
    [gt]
  );
  const tooltipLabelFormatter = useCallback((label: unknown) => gt("Turn: {turn}", { turn: label }), [gt]);
  const legendFormatter = useCallback((value: unknown) => (value === "personalPct" ? gt("Your Guesses") : gt("Global Average")), [gt]);

  return AsyncResult.builder(guessDistribution)
    .onInitialOrWaiting(() => <GuessDistributionChartSkeleton />)
    .onFailure(() => <GuessDistributionChartSkeleton />)
    .onSuccess((guessDistribution) =>
      guessDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Guesses needed to win a game")} message={gt("No Guesses yet!")} />
      ) : (
        <DistributionFrame title={gt("Guesses needed to win a game")} data={guessDistribution}>
          <ChartGrid />

          <XAxis dataKey="turn" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalPctBar />
          <GlobalPctLine />
        </DistributionFrame>
      )
    )
    .render();
}

export function GuessDistributionChartSkeleton() {
  const gt = useGT();

  return <DistributionSkeleton title={gt("Guesses needed to win a game")} />;
}
