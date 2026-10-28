// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { msg, useGT, useMessages } from "gt-react";
import { timeToSolveDistributionAtom } from "@/features/telemetry/state/charts";
import { XAxis } from "recharts";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/domain/formatters";

// components
import { DistributionEmpty } from "@/features/telemetry/ui/charts/distribution-shell";
import { DistributionChart } from "@/features/telemetry/ui/charts/distribution-chart";
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

  // `messages` from `useMessages()` is a stable reference, so plain render-time
  // functions are sufficient — `useCallback` would add a dependency array without
  // buying any memoization benefit (same reasoning as the other distribution charts)
  const formatSpeedCategory = (maxSeconds: number | null, emojiOnly: boolean = false) =>
    Option.match(maxSecondsToSpeedMultiplier(maxSeconds), {
      onNone: () => (emojiOnly ? "?" : messages(msg("Unknown"))),
      onSome: (speedMultiplier) => (emojiOnly ? speedMultiplierToCategoryEmoji(speedMultiplier) : messages(speedMultiplierToCategoryMessage(speedMultiplier))),
    });
  const tickFormatter = (tick: number | null) => formatSpeedCategory(tick, true);
  const tooltipFormatter = (value: unknown, name: unknown) => [`${String(value)}%`, name === "personalPct" ? gt("Your Speed") : gt("Global Average")] as const;
  const tooltipLabelFormatter = (label: unknown) => formatSpeedCategory(label as number | null);
  const legendFormatter = (value: unknown) => (value === "personalPct" ? gt("Your Speed") : gt("Global Average"));

  return AsyncResult.builder(timeToSolveDistribution)
    .onInitialOrWaiting(() => <TimeToSolveDistributionChartSkeleton />)
    .onFailure(() => <TimeToSolveDistributionChartSkeleton />)
    .onSuccess((timeToSolveDistribution) =>
      timeToSolveDistribution.length === 0 ? (
        <DistributionEmpty title={gt("Time taken to solve a word")} message={gt("No speed data tracked yet!")} />
      ) : (
        <DistributionChart
          title={gt("Time taken to solve a word")}
          data={timeToSolveDistribution}
          xAxis={<XAxis dataKey="maxSeconds" tickFormatter={tickFormatter} stroke="var(--color-text-1)" fontSize={32} />}
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
export { TimeToSolveDistributionChartSkeleton };
