// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getFailedWordsFrequenciesAction } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, BarChart, YAxis } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface FailedWordsFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const CHART_PADDING_PX = 96;
const BAR_HEIGHT_PX = 48;

function FailedWordsFrequencyChart({ solutionsLanguage }: FailedWordsFrequencyChartProps) {
  const [getFailedWordsFrequenciesResult, getFailedWordsFrequencies] = useAtom(getFailedWordsFrequenciesAction);

  useEffect(() => {
    getFailedWordsFrequencies();
  }, [getFailedWordsFrequencies]);

  return AsyncResult.builder(getFailedWordsFrequenciesResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((failedWordsFrequenciesData) => {
      const failedWordsFrequencyData = failedWordsFrequenciesData[solutionsLanguage === "En" ? 0 : 1];

      return failedWordsFrequencyData.length === 0 ? (
        <InfoLine message="No frequency data tracked yet!" />
      ) : (
        <BarChart
          data={failedWordsFrequencyData}
          responsive
          layout="vertical"
          className="w-full **:outline-none **:select-none"
          style={{ height: `${CHART_PADDING_PX + failedWordsFrequencyData.length * BAR_HEIGHT_PX}px` }}
        >
          <CartesianGrid stroke="var(--color-surface-3)" />

          <XAxis type="number" stroke="var(--color-text-1)" />
          <YAxis dataKey="word" type="category" stroke="var(--color-text-1)" />

          <Tooltip
            formatter={(value, name) => [`${value}`, name === "personal" ? "Your Misses" : "Global Misses"]}
            labelFormatter={(label) => `${label}`}
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
            labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
            itemStyle={{ color: "var(--color-text-2)" }}
          />
          <Legend
            formatter={(value) => (value === "personal" ? "Your Misses" : "Global Misses")}
            labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
          />

          <Bar dataKey="personal" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />
          <Bar dataKey="global" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />
        </BarChart>
      );
    })
    .render();
}

export function FailedWordsFrequencyCharts() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Frequency of words that players failed to guess
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <FailedWordsFrequencyChart solutionsLanguage="En" />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Frequency of words that players failed to guess
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <FailedWordsFrequencyChart solutionsLanguage="Pl" />
      </div>
    </section>
  );
}

export function FailedWordsFrequencyChartsSkeleton() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Frequency of words that players failed to guess
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
              Frequency of words that players failed to guess
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
    </section>
  );
}
