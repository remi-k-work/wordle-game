// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getGamesPlayedCountersAction } from "@/features/telemetry/state";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GamesPlayedCounterChartProps {
  solutionsLanguage: SolutionsLanguage;
}

function GamesPlayedCounterChart({ solutionsLanguage }: GamesPlayedCounterChartProps) {
  const [getGamesPlayedCountersResult, getGamesPlayedCounters] = useAtom(getGamesPlayedCountersAction);

  useEffect(() => {
    getGamesPlayedCounters();
  }, [getGamesPlayedCounters]);

  return AsyncResult.builder(getGamesPlayedCountersResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((gamesPlayedCountersData) => {
      const gamesPlayedCounterData = gamesPlayedCountersData[solutionsLanguage === "En" ? 0 : 1];

      return gamesPlayedCounterData.length === 0 ? (
        <InfoLine message="No counter data tracked yet!" />
      ) : (
        <article className="mx-auto flex w-full max-w-md gap-4 *:flex-1">
          <header className="flex flex-col items-center justify-center rounded-xl bg-(--color-surface-2) p-6 shadow-sm ring-1 ring-(--color-accent)">
            <h3 className="font-sans tracking-widest text-(--color-text-2)">Global Total</h3>
            <span className="mt-2 text-4xl font-semibold text-(--color-primary)">{gamesPlayedCounterData[0].global.toLocaleString()}</span>
          </header>

          <footer className="flex flex-col items-center justify-center rounded-xl bg-(--color-surface-2) p-6 shadow-sm ring-1 ring-(--color-accent)">
            <h3 className="font-sans tracking-widest text-(--color-text-2)">Your Games</h3>
            <span className="mt-2 text-4xl font-semibold text-(--color-secondary)">{gamesPlayedCounterData[0].personal.toLocaleString()}</span>
          </footer>
        </article>
      );
    })
    .render();
}

export function GamesPlayedCounterCharts() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Games Played Counter
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GamesPlayedCounterChart solutionsLanguage="En" />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Games Played Counter
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GamesPlayedCounterChart solutionsLanguage="Pl" />
      </div>
    </section>
  );
}

export function GamesPlayedCounterChartsSkeleton() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Games Played Counter
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
              Games Played Counter
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
    </section>
  );
}
