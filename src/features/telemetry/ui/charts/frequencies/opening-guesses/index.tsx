// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { openingGuessesFrequencyAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

export function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const openingGuessesFrequency = useAtomValue(openingGuessesFrequencyAtom(solutionsLanguage));

  return AsyncResult.builder(openingGuessesFrequency)
    .onInitialOrWaiting(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onFailure(() => <OpeningGuessesFrequencyChartSkeleton />)
    .onSuccess((openingGuessesFrequency) =>
      openingGuessesFrequency.length === 0 ? (
        <>
          <SectionHeader title="First word guessed in a game" />
          <InfoLine message="No frequency data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title="First word guessed in a game" />
          <BarChart
            data={openingGuessesFrequency}
            responsive
            layout="vertical"
            className="w-full **:outline-none **:select-none"
            style={{ height: `${CHART_PADDING_PX + openingGuessesFrequency.length * BAR_HEIGHT_PX}px` }}
          >
            <CartesianGrid stroke="var(--color-surface-3)" />

            <XAxis type="number" stroke="var(--color-text-1)" />
            <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

            <Tooltip
              formatter={(value, name) => [`${value}`, name === "personal" ? "Your Guesses" : "Global Guesses"]}
              labelFormatter={(label) => `${label}`}
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
              labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
              itemStyle={{ color: "var(--color-text-2)" }}
            />
            <Legend
              formatter={(value) => (value === "personal" ? "Your Guesses" : "Global Guesses")}
              labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
            />

            <Bar dataKey="personal" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />
            <Bar dataKey="global" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />
          </BarChart>
        </>
      )
    )
    .render();
}

export function OpeningGuessesFrequencyChartSkeleton() {
  return (
    <>
      <SectionHeaderSkeleton title="First word guessed in a game" />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
