// services, features, and other libraries
import { msg } from "gt-tanstack-start";

// components
import { SLIDE_CLASS } from "./slide";
import { DotSkeleton } from "./buttons/dot";
import { NextSkeleton } from "./buttons/next";
import { PrevSkeleton } from "./buttons/prev";
import { AnyAvgStatChartSkeleton } from "@/features/telemetry/ui/charts/any-avg-stat";
import { AnyCounterChartSkeleton } from "@/features/telemetry/ui/charts/any-counter";

// types
import type { AnyAvgStatArgs, AnyCounterArgs } from "@/features/telemetry/services/charts-db/models";

type TotalsSlideSpec =
  | { kind: "counter"; counterName: AnyCounterArgs["counterName"]; title: string; personalHeader: string }
  | {
      kind: "avg";
      statColumn: AnyAvgStatArgs["statColumn"];
      statTable: AnyAvgStatArgs["statTable"];
      title: string;
      personalHeader: string;
    };

// Single source of truth for the 10 slides — drives both the live slider
// (index.tsx) and its skeleton so titles/ordering cannot drift apart. The spec set
// deliberately lives in this recharts-free skeleton module: importing it from
// index.tsx instead would drag the embla carousel into the statically-bundled
// page shell
const TOTALS_SLIDES = [
  { kind: "counter", counterName: "gamesPlayed", title: msg("Games played"), personalHeader: msg("Your Games") },
  { kind: "counter", counterName: "runsStarted", title: msg("Arcade runs started"), personalHeader: msg("Your Runs") },
  { kind: "counter", counterName: "perfectGames", title: msg("Games solved on the first guess"), personalHeader: msg("Your Perfect Games") },
  { kind: "counter", counterName: "invalidGuesses", title: msg("Invalid guesses (not in dictionary)"), personalHeader: msg("Your Invalid Guesses") },
  { kind: "counter", counterName: "validGuesses", title: msg("Valid guesses submitted"), personalHeader: msg("Your Valid Guesses") },
  { kind: "avg", statColumn: "guessedTurn", statTable: "runWordEvent", title: msg("Average guesses to win"), personalHeader: msg("Your Average Guesses") },
  { kind: "avg", statColumn: "timeSeconds", statTable: "runWordEvent", title: msg("Average time to solve a word"), personalHeader: msg("Your Average Time") },
  {
    kind: "avg",
    statColumn: "finalScore",
    statTable: "arcadeRunSummary",
    title: msg("Average score per arcade run"),
    personalHeader: msg("Your Average Score"),
  },
  {
    kind: "avg",
    statColumn: "finalStreak",
    statTable: "arcadeRunSummary",
    title: msg("Average streak per arcade run"),
    personalHeader: msg("Your Average Streak"),
  },
  {
    kind: "avg",
    statColumn: "durationSeconds",
    statTable: "arcadeRunSummary",
    title: msg("Average run duration"),
    personalHeader: msg("Your Average Duration"),
  },
] as const satisfies ReadonlyArray<TotalsSlideSpec>;

export { TOTALS_SLIDES };
export type { TotalsSlideSpec };

export function TotalsSlideSkeleton({ spec }: { spec: TotalsSlideSpec }) {
  if (spec.kind === "counter") return <AnyCounterChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;

  return <AnyAvgStatChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;
}

export function TotalsSliderSkeleton() {
  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          {TOTALS_SLIDES.map((spec, index) => (
            <div key={index} className={SLIDE_CLASS}>
              <TotalsSlideSkeleton spec={spec} />
            </div>
          ))}
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <PrevSkeleton />
        <NextSkeleton />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {TOTALS_SLIDES.map((_, index) => (
          <DotSkeleton key={index} />
        ))}
      </footer>
    </article>
  );
}
