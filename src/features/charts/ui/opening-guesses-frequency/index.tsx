// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { useGT } from "gt-react";
import { openingGuessesFrequencyAtom } from "@/features/charts/state/charts";
import { XAxis, YAxis } from "recharts";
import { formatCount, makeSeriesLabels } from "@/features/charts/ui/chart-series";

// components
import { ChartSection } from "@/features/charts/ui/chart-section";
import { HorizontalFrequencyChart } from "@/features/charts/ui/horizontal-frequency-chart";
import { OpeningGuessesFrequencyChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const openingGuessesFrequency = useAtomValue(openingGuessesFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const seriesLabels = makeSeriesLabels({ personalKey: "personal", personal: gt("Your Guesses"), global: gt("Global Guesses"), formatValue: formatCount });

  // Both the empty state and the chart carry the same heading, so it is resolved once here instead of being re-translated in each branch
  const title = gt("First word guessed in a game");

  return (
    <ChartSection
      title={title}
      result={openingGuessesFrequency}
      skeleton={<OpeningGuessesFrequencyChartSkeleton />}
      emptyMessage={gt("No frequency data tracked yet!")}
    >
      {(rows) => (
        <HorizontalFrequencyChart
          title={title}
          data={rows}
          xAxis={<XAxis type="number" stroke="var(--color-text-1)" />}
          yAxis={<YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />}
          tooltipFormatter={seriesLabels.tooltipFormatter}
          legendFormatter={seriesLabels.legendFormatter}
        />
      )}
    </ChartSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { OpeningGuessesFrequencyChartSkeleton };
