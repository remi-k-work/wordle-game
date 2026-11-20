// services, features, and other libraries
import { Option, Predicate } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { msg, useGT, useMessages } from "gt-react";
import { timeToSolveDistributionAtom } from "@/features/charts/state/charts";
import { XAxis } from "recharts";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/domain/formatters";
import { formatPercent, makeSeriesLabels } from "@/features/charts/ui/chart-series";

// components
import { ChartSection } from "@/features/charts/ui/chart-section";
import { DistributionChart } from "@/features/charts/ui/distribution-chart";
import { TimeToSolveDistributionChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface TimeToSolveDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TimeToSolveDistributionChart({ solutionsLanguage }: TimeToSolveDistributionChartProps) {
  const timeToSolveDistribution = useAtomValue(timeToSolveDistributionAtom(solutionsLanguage));
  const gt = useGT();
  const messages = useMessages();

  const seriesLabels = makeSeriesLabels({ personalKey: "personalPct", personal: gt("Your Speed"), global: gt("Global Average"), formatValue: formatPercent });

  const formatSpeedCategory = (maxSeconds: number | null, emojiOnly: boolean = false) => {
    const mult = maxSecondsToSpeedMultiplier(maxSeconds);
    return Option.isSome(mult)
      ? emojiOnly
        ? speedMultiplierToCategoryEmoji(mult.value)
        : messages(speedMultiplierToCategoryMessage(mult.value))
      : emojiOnly
        ? "?"
        : messages(msg("Unknown"));
  };
  const tickFormatter = (tick: number | null) => formatSpeedCategory(tick, true);
  // Recharts hands tooltip labels over as `unknown`; a non-number label (a
  // malformed tick) resolves to the "Unknown" fallback instead of being cast
  // into the number path
  const tooltipLabelFormatter = (label: unknown) => formatSpeedCategory(Predicate.isNumber(label) ? label : null);

  // Both the empty state and the chart carry the same heading, so it is resolved once here instead of being re-translated in each branch
  const title = gt("Time taken to solve a word");

  return (
    <ChartSection
      title={title}
      result={timeToSolveDistribution}
      skeleton={<TimeToSolveDistributionChartSkeleton />}
      emptyMessage={gt("No speed data tracked yet!")}
    >
      {(rows) => (
        <DistributionChart
          title={title}
          data={rows}
          xAxis={<XAxis dataKey="maxSeconds" tickFormatter={tickFormatter} stroke="var(--color-text-1)" fontSize={32} />}
          tooltipFormatter={seriesLabels.tooltipFormatter}
          tooltipLabelFormatter={tooltipLabelFormatter}
          legendFormatter={seriesLabels.legendFormatter}
        />
      )}
    </ChartSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of
// the live chart and re-exported so the module's public API is unchanged
export { TimeToSolveDistributionChartSkeleton };
