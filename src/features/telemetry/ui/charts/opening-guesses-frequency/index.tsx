// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getOpeningGuessesFrequenciesAction } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface OpeningGuessesFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

function OpeningGuessesFrequencyChart({ solutionsLanguage }: OpeningGuessesFrequencyChartProps) {
  const [getOpeningGuessesFrequenciesResult, getOpeningGuessesFrequencies] = useAtom(getOpeningGuessesFrequenciesAction);

  useEffect(() => {
    getOpeningGuessesFrequencies();
  }, [getOpeningGuessesFrequencies]);

  return AsyncResult.builder(getOpeningGuessesFrequenciesResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((openingGuessesFrequenciesData) => {
      const openingGuessesFrequencyData = openingGuessesFrequenciesData[solutionsLanguage === "En" ? 0 : 1];

      return openingGuessesFrequencyData.length === 0 ? (
        <InfoLine message="No frequency data tracked yet!" />
      ) : (
        <BarChart
          data={openingGuessesFrequencyData}
          responsive
          layout="vertical"
          className="w-full **:outline-none **:select-none"
          style={{ height: `${CHART_PADDING_PX + openingGuessesFrequencyData.length * BAR_HEIGHT_PX}px` }}
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

          <Bar dataKey="global" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />
          <Bar dataKey="personal" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />
        </BarChart>
      );
    })
    .render();
}

export function OpeningGuessesFrequencyCharts() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Opening Guesses Frequency
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <OpeningGuessesFrequencyChart solutionsLanguage="En" />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Opening Guesses Frequency
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <OpeningGuessesFrequencyChart solutionsLanguage="Pl" />
      </div>
    </section>
  );
}

export function OpeningGuessesFrequencyChartsSkeleton() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Opening Guesses Frequency
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Opening Guesses Frequency
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
    </section>
  );
}
