// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react";
import { guessDistributionAtom } from "@/features/telemetry/state/charts";
import { XAxis } from "recharts";

// components
import { DistributionEmpty } from "@/features/telemetry/ui/charts/distribution-shell";
import { DistributionChart } from "@/features/telemetry/ui/charts/distribution-chart";
import { GuessDistributionChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistribution = useAtomValue(guessDistributionAtom(solutionsLanguage));
  const gt = useGT();

  // Formatters are invoked by recharts during render; the recharts wrapper
  // components (ChartTooltip, ChartLegend, XAxis) are not memoized, so a
  // stable callback reference buys nothing; plain render-time functions keep
  // the dependency surface simple and always read the latest `gt` via closure
  // — same reasoning as run-death-reason's tooltipFormatter
  const tickFormatter = (tick: number) => gt("Turn {turn}", { turn: tick });
  const tooltipFormatter = (value: unknown, name: unknown) =>
    [`${String(value)}%`, name === "personalPct" ? gt("Your Guesses") : gt("Global Average")] as const;
  const tooltipLabelFormatter = (label: unknown) => gt("Turn: {turn}", { turn: label });
  const legendFormatter = (value: unknown) => (value === "personalPct" ? gt("Your Guesses") : gt("Global Average"));

  return AsyncResult.builder(guessDistribution)
    .onInitialOrWaiting(() => <GuessDistributionChartSkeleton />)
    .onFailure(() => <GuessDistributionChartSkeleton />)
    .onSuccess((guessDistribution) =>
      guessDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Guesses needed to win a game")} message={gt("No Guesses yet!")} />
      ) : (
        <DistributionChart
          title={gt("Guesses needed to win a game")}
          data={guessDistribution}
          xAxis={<XAxis dataKey="turn" tickFormatter={tickFormatter} stroke="var(--color-text-1)" />}
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
export { GuessDistributionChartSkeleton };
