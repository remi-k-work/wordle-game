// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { msg, useGT, useMessages } from "gt-next";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/ui/speed-multiplier-category";
import { timeToSolveDistributionAtom } from "@/features/telemetry/state";
import { XAxis, ComposedChart } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TimeToSolveDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TimeToSolveDistributionChart({ solutionsLanguage }: TimeToSolveDistributionChartProps) {
  const timeToSolveDistribution = useAtomValue(timeToSolveDistributionAtom(solutionsLanguage));
  const gt = useGT();
  const messages = useMessages();
  const formatSpeedCategory = (maxSeconds: number | null, emojiOnly: boolean = false) => {
    const speedMultiplier = maxSecondsToSpeedMultiplier(maxSeconds);
    if (speedMultiplier === undefined) return emojiOnly ? "?" : messages(msg("Unknown"));

    return emojiOnly ? speedMultiplierToCategoryEmoji(speedMultiplier) : messages(speedMultiplierToCategoryMessage(speedMultiplier));
  };

  return AsyncResult.builder(timeToSolveDistribution)
    .onInitialOrWaiting(() => <TimeToSolveDistributionChartSkeleton />)
    .onFailure(() => <TimeToSolveDistributionChartSkeleton />)
    .onSuccess((timeToSolveDistribution) =>
      timeToSolveDistribution.length === 0 ? (
        <>
          <SectionHeader title={gt("Time taken to solve a word")} />
          <InfoLine message={gt("No speed data tracked yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("Time taken to solve a word")} />
          <ComposedChart data={timeToSolveDistribution} responsive className="h-96 w-full **:outline-none **:select-none lg:h-192">
            <ChartGrid />

            <XAxis dataKey="maxSeconds" tickFormatter={(tick) => formatSpeedCategory(tick, true)} stroke="var(--color-text-1)" fontSize={32} />

            <ChartTooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? gt("Your Speed") : gt("Global Average")]}
              labelFormatter={(label) => formatSpeedCategory(label as number | null)}
            />
            <ChartLegend formatter={(value) => (value === "personalPct" ? gt("Your Speed") : gt("Global Average"))} />

            <PersonalPctBar />
            <GlobalPctLine />
          </ComposedChart>
        </>
      )
    )
    .render();
}

export function TimeToSolveDistributionChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Time taken to solve a word")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
