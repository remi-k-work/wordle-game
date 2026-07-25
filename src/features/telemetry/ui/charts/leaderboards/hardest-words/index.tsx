// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { hardestWordsLeaderboardAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, BarChart, YAxis } from "recharts";
import { formatDuration } from "@/features/game/domain";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface HardestWordsLeaderboardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

export function HardestWordsLeaderboardChart({ solutionsLanguage }: HardestWordsLeaderboardChartProps) {
  const hardestWordsLeaderboard = useAtomValue(hardestWordsLeaderboardAtom(solutionsLanguage));

  return AsyncResult.builder(hardestWordsLeaderboard)
    .onInitialOrWaiting(() => <HardestWordsLeaderboardChartSkeleton />)
    .onFailure(() => <HardestWordsLeaderboardChartSkeleton />)
    .onSuccess((hardestWordsLeaderboard) =>
      hardestWordsLeaderboard.length === 0 ? (
        <>
          <SectionHeader title="Hardest words by average solve time" />
          <InfoLine message="No leaderboard data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title="Hardest words by average solve time" />
          <BarChart
            data={hardestWordsLeaderboard}
            responsive
            layout="vertical"
            className="w-full **:outline-none **:select-none"
            style={{ height: `${CHART_PADDING_PX + hardestWordsLeaderboard.length * BAR_HEIGHT_PX}px` }}
          >
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis type="number" stroke="var(--color-text-1)" tickFormatter={(value) => formatDuration(Duration.seconds(value))} />
            <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

            <Tooltip
              formatter={(value, name) => {
                const seconds = Number(value);
                return [formatDuration(Duration.seconds(seconds)), name === "personalAvgTimeSeconds" ? "Your Average Time" : "Global Average Time"];
              }}
              labelFormatter={(label, payload) => {
                const row = payload?.[0]?.payload;
                return (
                  <>
                    {label}
                    <br />
                    <span className="font-mono font-normal">Global Average Guesses : {row?.globalAvgGuesses?.toFixed(1)}</span>
                    <br />
                    <span className="font-mono font-normal">Your Average Guesses : {row?.personalAvgGuesses?.toFixed(1)}</span>
                  </>
                );
              }}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personalAvgTimeSeconds" ? "Your Average Time" : "Global Average Time")}
              labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
            />

            <Bar dataKey="personalAvgTimeSeconds" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />
            <Bar dataKey="globalAvgTimeSeconds" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />
          </BarChart>
        </>
      )
    )
    .render();
}

export function HardestWordsLeaderboardChartSkeleton() {
  return (
    <>
      <SectionHeader title="Hardest words by average solve time" />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
