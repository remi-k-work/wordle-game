// services, features, and other libraries
import { useGT } from "gt-react";
import { useAtomValue } from "@effect/atom-react";
import { guessDistributionAtom } from "@/features/charts/state/charts";
import { XAxis } from "recharts";
import { formatPercent, makeSeriesLabels } from "@/features/charts/ui/chart-series";

// components
import { ChartSection } from "@/features/charts/ui/chart-section";
import { DistributionChart } from "@/features/charts/ui/distribution-chart";
import { GuessDistributionChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistribution = useAtomValue(guessDistributionAtom(solutionsLanguage));
  const gt = useGT();

  // The personal series is labelled against the global average everywhere both appear (tooltip and legend), so the pair is resolved once here
  const seriesLabels = makeSeriesLabels({ personalKey: "personalPct", personal: gt("Your Guesses"), global: gt("Global Average"), formatValue: formatPercent });

  const tickFormatter = (tick: number) => gt("Turn {turn}", { turn: tick });
  const tooltipLabelFormatter = (label: unknown) => gt("Turn: {turn}", { turn: label });

  // Both the empty state and the chart carry the same heading, so it is resolved once here instead of being re-translated in each branch
  const title = gt("Guesses needed to win a game");

  return (
    <ChartSection title={title} result={guessDistribution} skeleton={<GuessDistributionChartSkeleton />} emptyMessage={gt("No Guesses yet!")}>
      {(rows) => (
        <DistributionChart
          title={title}
          data={rows}
          xAxis={<XAxis dataKey="turn" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />}
          tooltipFormatter={seriesLabels.tooltipFormatter}
          tooltipLabelFormatter={tooltipLabelFormatter}
          legendFormatter={seriesLabels.legendFormatter}
        />
      )}
    </ChartSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { GuessDistributionChartSkeleton };
