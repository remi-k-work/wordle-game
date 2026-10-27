// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react";
import { openingGuessesFrequencyAtom } from "@/features/telemetry/state/charts";
import { XAxis, YAxis } from "recharts";

// components
import { HorizontalBarEmpty } from "@/features/telemetry/ui/charts/horizontal-bar-shell";
import { HorizontalFrequencyChart } from "@/features/telemetry/ui/charts/horizontal-frequency-chart";
import { OpeningGuessesFrequencyChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const openingGuessesFrequency = useAtomValue(openingGuessesFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const tooltipFormatter = (value: unknown, name: unknown) => [`${String(value)}`, name === "personal" ? gt("Your Guesses") : gt("Global Guesses")] as const;
  const tooltipLabelFormatter = (label: unknown) => String(label);
  const legendFormatter = (value: unknown) => (value === "personal" ? gt("Your Guesses") : gt("Global Guesses"));

  return AsyncResult.builder(openingGuessesFrequency)
    .onInitialOrWaiting(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onFailure(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onSuccess((openingGuessesFrequency) =>
      openingGuessesFrequency.length === 0 ? (
        <HorizontalBarEmpty title={gt("First word guessed in a game")} message={gt("No frequency data tracked yet!")} />
      ) : (
        <HorizontalFrequencyChart
          title={gt("First word guessed in a game")}
          data={openingGuessesFrequency}
          xAxis={<XAxis type="number" stroke="var(--color-text-1)" />}
          yAxis={<YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />}
          tooltipFormatter={tooltipFormatter}
          tooltipLabelFormatter={tooltipLabelFormatter}
          legendFormatter={legendFormatter}
        />
      )
    )
    .render();
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { OpeningGuessesFrequencyChartSkeleton };
