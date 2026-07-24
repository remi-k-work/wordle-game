// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";

// components
import { Dot, DotSkeleton, Next, NextSkeleton, Prev, PrevSkeleton } from "./buttons";
import { AnyAvgStatChart, AnyAvgStatChartSkeleton, AnyCounterChart, AnyCounterChartSkeleton } from "@/features/telemetry/ui/charts";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChart counterName="gamesPlayed" solutionsLanguage={solutionsLanguage} title="Games played" personalHeader="Your Games" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChart counterName="runsStarted" solutionsLanguage={solutionsLanguage} title="Arcade runs started" personalHeader="Your Runs" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChart
              counterName="perfectGames"
              solutionsLanguage={solutionsLanguage}
              title="Games solved on the first guess"
              personalHeader="Your Perfect Games"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChart
              counterName="invalidGuesses"
              solutionsLanguage={solutionsLanguage}
              title="Invalid guesses (not in dictionary)"
              personalHeader="Your Invalid Guesses"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChart
              counterName="validGuesses"
              solutionsLanguage={solutionsLanguage}
              title="Valid guesses submitted"
              personalHeader="Your Valid Guesses"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChart
              statColumn="guessedTurn"
              statTable="runWordEvent"
              solutionsLanguage={solutionsLanguage}
              title="Average guesses to win"
              personalHeader="Your Average Guesses"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChart
              statColumn="timeSeconds"
              statTable="runWordEvent"
              solutionsLanguage={solutionsLanguage}
              title="Average time to solve a word"
              personalHeader="Your Average Time"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChart
              statColumn="finalScore"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title="Average score per arcade run"
              personalHeader="Your Average Score"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChart
              statColumn="finalStreak"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title="Average streak per arcade run"
              personalHeader="Your Average Streak"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChart
              statColumn="durationSeconds"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title="Average run duration"
              personalHeader="Your Average Duration"
            />
          </div>
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <Prev emblaApi={emblaApi} />
        <Next emblaApi={emblaApi} />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {emblaApi?.scrollSnapList().map((_, index) => (
          <Dot key={index} emblaApi={emblaApi} index={index} />
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
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Games played" personalHeader="Your Games" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Arcade runs started" personalHeader="Your Runs" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Games solved on the first guess" personalHeader="Your Perfect Games" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Invalid guesses (not in dictionary)" personalHeader="Your Invalid Guesses" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Valid guesses submitted" personalHeader="Your Valid Guesses" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title="Average guesses to win" personalHeader="Your Average Guesses" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title="Average time to solve a word" personalHeader="Your Average Time" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title="Average score per arcade run" personalHeader="Your Average Score" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title="Average streak per arcade run" personalHeader="Your Average Streak" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title="Average run duration" personalHeader="Your Average Duration" />
          </div>
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <PrevSkeleton />
        <NextSkeleton />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {[...Array(10)].map((_, index) => (
          <DotSkeleton key={index} />
        ))}
      </footer>
    </article>
  );
}
