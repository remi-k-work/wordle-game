// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";

// components
import { Dot, Next, Prev } from "./buttons";
import { AnyCounterChart } from "@/features/telemetry/ui/charts";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4">
            <AnyCounterChart
              counterName="gamesPlayed"
              solutionsLanguage={solutionsLanguage}
              title="Total number of games played (both won and lost)"
              personalHeader="Your Games"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4">
            <AnyCounterChart
              counterName="runsStarted"
              solutionsLanguage={solutionsLanguage}
              title="Total number of arcade runs started"
              personalHeader="Your Runs"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4">
            <AnyCounterChart
              counterName="perfectGames"
              solutionsLanguage={solutionsLanguage}
              title="Total number of games won on the first try"
              personalHeader="Your Perfect Games"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4">
            <AnyCounterChart
              counterName="invalidGuesses"
              solutionsLanguage={solutionsLanguage}
              title="Total number of invalid guesses (not in dictionary)"
              personalHeader="Your Invalid Guesses"
            />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4">
            <AnyCounterChart
              counterName="validGuesses"
              solutionsLanguage={solutionsLanguage}
              title="Total number of valid guesses submitted"
              personalHeader="Your Valid Guesses"
            />
          </div>
        </div>
      </section>
      <header className="flex items-center gap-4 [grid-area:prevnext]">
        <Prev emblaApi={emblaApi} />
        <Next emblaApi={emblaApi} />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 [grid-area:dots]">
        {emblaApi?.scrollSnapList().map((_, index) => (
          <Dot key={index} emblaApi={emblaApi} index={index} />
        ))}
      </footer>
    </article>
  );
}
