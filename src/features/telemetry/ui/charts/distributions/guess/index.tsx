// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { guessDistributionAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistribution = useAtomValue(guessDistributionAtom(solutionsLanguage));
  const gt = useGT();

  return AsyncResult.builder(guessDistribution)
    .onInitialOrWaiting(() => <GuessDistributionChartSkeleton />)
    .onFailure(() => <GuessDistributionChartSkeleton />)
    .onSuccess((guessDistribution) =>
      guessDistribution.length === 0 ? (
        <>
          <SectionHeader title={gt("Guesses needed to win a game")} />
          <InfoLine message={gt("No Guesses yet!")} />
        </>
      ) : (
        <>
          <SectionHeader title={gt("Guesses needed to win a game")} />
          <ComposedChart data={guessDistribution} responsive className="h-96 w-full **:outline-none **:select-none lg:h-192">
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis dataKey="turn" tickFormatter={(tick) => gt("Turn {turn}", { turn: tick })} stroke="var(--color-text-1)" />

            <Tooltip
              formatter={(value, name) => [`${value}%`, name === "personalPct" ? gt("Your Guesses") : gt("Global Average")]}
              labelFormatter={(label) => gt("Turn: {turn}", { turn: label })}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personalPct" ? gt("Your Guesses") : gt("Global Average"))}
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

export function GuessDistributionChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Guesses needed to win a game")} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
