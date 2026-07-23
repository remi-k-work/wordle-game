// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";

// components
import { Dot, DotSkeleton, Next, NextSkeleton, Prev, PrevSkeleton } from "./buttons";
import { AnyCounterChart, AnyCounterChartSkeleton } from "@/features/telemetry/ui/charts";

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
              title="Games won on the first try"
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
            <AnyCounterChartSkeleton title="Games won on the first try" personalHeader="Your Perfect Games" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Invalid guesses (not in dictionary)" personalHeader="Your Invalid Guesses" />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title="Valid guesses submitted" personalHeader="Your Valid Guesses" />
          </div>
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <PrevSkeleton />
        <NextSkeleton />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {[...Array(5)].map((_, index) => (
          <DotSkeleton key={index} />
        ))}
      </footer>
    </article>
  );
}
