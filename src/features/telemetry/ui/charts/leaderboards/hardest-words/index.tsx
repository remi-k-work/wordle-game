// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react";
import { hardestWordsLeaderboardAtom } from "@/features/telemetry/state/charts";
import { XAxis, YAxis } from "recharts";
import { formatSeconds } from "@/domain/formatters";

// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarEmpty, HorizontalBarFrame } from "@/features/telemetry/ui/charts/horizontal-bar-shell";
import { HardestWordsLeaderboardChartSkeleton } from "./skeleton";

// types
import type { TooltipPayloadEntry } from "recharts";
import type { HardestWordsLeaderboardData } from "@/features/telemetry/services/charts-db/models";
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface HardestWordsLeaderboardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// Recharts types the row behind a tooltip entry as `any`; narrow it to the
// schema-decoded leaderboard row this chart actually passes in
type HardestWordsTooltipEntry = Omit<TooltipPayloadEntry, "payload"> & {
  readonly payload?: HardestWordsLeaderboardData;
};

export function HardestWordsLeaderboardChart({ solutionsLanguage }: HardestWordsLeaderboardChartProps) {
  const hardestWordsLeaderboard = useAtomValue(hardestWordsLeaderboardAtom(solutionsLanguage));
  const gt = useGT();

  const tickFormatter = useCallback((value: number) => formatSeconds(value), []);
  const tooltipFormatter = useCallback(
    (value: unknown, name: unknown) =>
      [formatSeconds(Number(value)), name === "personalAvgTimeSeconds" ? gt("Your Average Time") : gt("Global Average Time")] as const,
    [gt]
  );
  const tooltipLabelFormatter = useCallback(
    (label: unknown, payload: ReadonlyArray<HardestWordsTooltipEntry>) => {
      const row = payload[0]?.payload;
      return (
        <>
          {label}
          <br />
          <span className="font-mono font-normal">{gt("Global Average Guesses: {count}", { count: row?.globalAvgGuesses.toFixed(1) ?? "—" })}</span>
          <br />
          <span className="font-mono font-normal">{gt("Your Average Guesses: {count}", { count: row?.personalAvgGuesses.toFixed(1) ?? "—" })}</span>
        </>
      );
    },
    [gt]
  );
  const legendFormatter = useCallback((value: unknown) => (value === "personalAvgTimeSeconds" ? gt("Your Average Time") : gt("Global Average Time")), [gt]);

  return AsyncResult.builder(hardestWordsLeaderboard)
    .onInitialOrWaiting(() => <HardestWordsLeaderboardChartSkeleton />)
    .onFailure(() => <HardestWordsLeaderboardChartSkeleton />)
    .onSuccess((hardestWordsLeaderboard) =>
      hardestWordsLeaderboard.length === 0 ? (
        <HorizontalBarEmpty title={gt("Hardest words by average solve time")} message={gt("No leaderboard data tracked yet!")} />
      ) : (
        <HorizontalBarFrame title={gt("Hardest words by average solve time")} data={hardestWordsLeaderboard}>
          <ChartGrid />

          <XAxis type="number" stroke="var(--color-text-1)" tickFormatter={tickFormatter} />
          <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

          <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
          <ChartLegend formatter={legendFormatter} />

          <PersonalBar dataKey="personalAvgTimeSeconds" />
          <GlobalBar dataKey="globalAvgTimeSeconds" />
        </HorizontalBarFrame>
      )
    )
    .render();
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { HardestWordsLeaderboardChartSkeleton };
