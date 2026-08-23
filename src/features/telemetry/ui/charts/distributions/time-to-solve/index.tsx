// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { msg, useGT, useMessages } from "gt-next";
import { maxSecondsToSpeedMultiplier, speedMultiplierToCategoryEmoji, speedMultiplierToCategoryMessage } from "@/features/game/ui/speed-multiplier-category";
import { timeToSolveDistributionAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

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
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis dataKey="maxSeconds" tickFormatter={(tick) => formatSpeedCategory(tick, true)} stroke="var(--color-text-1)" fontSize={32} />

            <Tooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? gt("Your Speed") : gt("Global Average")]}
              labelFormatter={(label) => formatSpeedCategory(label as number | null)}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personalPct" ? gt("Your Speed") : gt("Global Average"))}
              labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
            />

            <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[9, 9, 0, 0]} />
            <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />
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
