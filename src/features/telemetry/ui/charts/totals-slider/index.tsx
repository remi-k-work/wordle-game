// react
import { useCallback } from "react";

// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";
import { msg } from "gt-next";
import { useEmblaSelect } from "./hooks";

// components
import { Slide, SLIDE_CLASS } from "./slide";
import { Dot, DotSkeleton, Next, NextSkeleton, Prev, PrevSkeleton } from "./buttons";
import { AnyAvgStatChart, AnyAvgStatChartSkeleton } from "../any-avg-stat";
import { AnyCounterChart, AnyCounterChartSkeleton } from "../any-counter";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { AnyAvgStatArgs, AnyCounterArgs } from "@/features/telemetry/services/charts-db";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

type TotalsSlideSpec =
  | { kind: "counter"; counterName: AnyCounterArgs["counterName"]; title: string; personalHeader: string }
  | {
      kind: "avg";
      statColumn: AnyAvgStatArgs["statColumn"];
      statTable: AnyAvgStatArgs["statTable"];
      title: string;
      personalHeader: string;
    };

// Single source of truth for the 10 slides — drives both the live slider and
// its skeleton so titles/ordering cannot drift apart.
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

function TotalsSlideChart({ spec, solutionsLanguage }: { spec: TotalsSlideSpec; solutionsLanguage: SolutionsLanguage }) {
  if (spec.kind === "counter")
    return <AnyCounterChart counterName={spec.counterName} solutionsLanguage={solutionsLanguage} title={spec.title} personalHeader={spec.personalHeader} />;

  return (
    <AnyAvgStatChart
      statColumn={spec.statColumn}
      statTable={spec.statTable}
      solutionsLanguage={solutionsLanguage}
      title={spec.title}
      personalHeader={spec.personalHeader}
    />
  );
}

function TotalsSlideSkeleton({ spec }: { spec: TotalsSlideSpec }) {
  if (spec.kind === "counter") return <AnyCounterChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;

  return <AnyAvgStatChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;
}

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const { selectedIndex, canScrollPrev, canScrollNext } = useEmblaSelect(emblaApi);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => () => emblaApi?.scrollTo(index), [emblaApi]);
  const snapCount = emblaApi?.scrollSnapList().length ?? 0;

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          {TOTALS_SLIDES.map((spec, index) => (
            <Slide key={index} index={index} selectedIndex={selectedIndex} skeleton={<TotalsSlideSkeleton spec={spec} />}>
              <TotalsSlideChart spec={spec} solutionsLanguage={solutionsLanguage} />
            </Slide>
          ))}
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <Prev onPrev={scrollPrev} disabled={!canScrollPrev} />
        <Next onNext={scrollNext} disabled={!canScrollNext} />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {Array.from({ length: snapCount }, (_, index) => (
          <Dot key={index} index={index} selected={index === selectedIndex} onSelect={scrollTo(index)} />
        ))}
      </footer>
    </article>
  );
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
