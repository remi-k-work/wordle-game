// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";
import { msg } from "gt-next";

// components
import { Slide } from "./slide";
import { Dot, DotSkeleton, Next, NextSkeleton, Prev, PrevSkeleton } from "./buttons";
import { AnyAvgStatChart, AnyAvgStatChartSkeleton, AnyCounterChart, AnyCounterChartSkeleton } from "@/features/telemetry/ui/charts";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { EmblaCarouselType } from "embla-carousel";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (emblaApi: EmblaCarouselType) => setSelectedIndex(emblaApi.selectedScrollSnap());

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          <Slide index={0} selectedIndex={selectedIndex} skeleton={<AnyCounterChartSkeleton title={msg("Games played")} personalHeader={msg("Your Games")} />}>
            <AnyCounterChart counterName="gamesPlayed" solutionsLanguage={solutionsLanguage} title={msg("Games played")} personalHeader={msg("Your Games")} />
          </Slide>
          <Slide
            index={1}
            selectedIndex={selectedIndex}
            skeleton={<AnyCounterChartSkeleton title={msg("Arcade runs started")} personalHeader={msg("Your Runs")} />}
          >
            <AnyCounterChart
              counterName="runsStarted"
              solutionsLanguage={solutionsLanguage}
              title={msg("Arcade runs started")}
              personalHeader={msg("Your Runs")}
            />
          </Slide>
          <Slide
            index={2}
            selectedIndex={selectedIndex}
            skeleton={<AnyCounterChartSkeleton title={msg("Games solved on the first guess")} personalHeader={msg("Your Perfect Games")} />}
          >
            <AnyCounterChart
              counterName="perfectGames"
              solutionsLanguage={solutionsLanguage}
              title={msg("Games solved on the first guess")}
              personalHeader={msg("Your Perfect Games")}
            />
          </Slide>
          <Slide
            index={3}
            selectedIndex={selectedIndex}
            skeleton={<AnyCounterChartSkeleton title={msg("Invalid guesses (not in dictionary)")} personalHeader={msg("Your Invalid Guesses")} />}
          >
            <AnyCounterChart
              counterName="invalidGuesses"
              solutionsLanguage={solutionsLanguage}
              title={msg("Invalid guesses (not in dictionary)")}
              personalHeader={msg("Your Invalid Guesses")}
            />
          </Slide>
          <Slide
            index={4}
            selectedIndex={selectedIndex}
            skeleton={<AnyCounterChartSkeleton title={msg("Valid guesses submitted")} personalHeader={msg("Your Valid Guesses")} />}
          >
            <AnyCounterChart
              counterName="validGuesses"
              solutionsLanguage={solutionsLanguage}
              title={msg("Valid guesses submitted")}
              personalHeader={msg("Your Valid Guesses")}
            />
          </Slide>
          <Slide
            index={5}
            selectedIndex={selectedIndex}
            skeleton={<AnyAvgStatChartSkeleton title={msg("Average guesses to win")} personalHeader={msg("Your Average Guesses")} />}
          >
            <AnyAvgStatChart
              statColumn="guessedTurn"
              statTable="runWordEvent"
              solutionsLanguage={solutionsLanguage}
              title={msg("Average guesses to win")}
              personalHeader={msg("Your Average Guesses")}
            />
          </Slide>
          <Slide
            index={6}
            selectedIndex={selectedIndex}
            skeleton={<AnyAvgStatChartSkeleton title={msg("Average time to solve a word")} personalHeader={msg("Your Average Time")} />}
          >
            <AnyAvgStatChart
              statColumn="timeSeconds"
              statTable="runWordEvent"
              solutionsLanguage={solutionsLanguage}
              title={msg("Average time to solve a word")}
              personalHeader={msg("Your Average Time")}
            />
          </Slide>
          <Slide
            index={7}
            selectedIndex={selectedIndex}
            skeleton={<AnyAvgStatChartSkeleton title={msg("Average score per arcade run")} personalHeader={msg("Your Average Score")} />}
          >
            <AnyAvgStatChart
              statColumn="finalScore"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title={msg("Average score per arcade run")}
              personalHeader={msg("Your Average Score")}
            />
          </Slide>
          <Slide
            index={8}
            selectedIndex={selectedIndex}
            skeleton={<AnyAvgStatChartSkeleton title={msg("Average streak per arcade run")} personalHeader={msg("Your Average Streak")} />}
          >
            <AnyAvgStatChart
              statColumn="finalStreak"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title={msg("Average streak per arcade run")}
              personalHeader={msg("Your Average Streak")}
            />
          </Slide>
          <Slide
            index={9}
            selectedIndex={selectedIndex}
            skeleton={<AnyAvgStatChartSkeleton title={msg("Average run duration")} personalHeader={msg("Your Average Duration")} />}
          >
            <AnyAvgStatChart
              statColumn="durationSeconds"
              statTable="arcadeRunSummary"
              solutionsLanguage={solutionsLanguage}
              title={msg("Average run duration")}
              personalHeader={msg("Your Average Duration")}
            />
          </Slide>
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
            <AnyCounterChartSkeleton title={msg("Games played")} personalHeader={msg("Your Games")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title={msg("Arcade runs started")} personalHeader={msg("Your Runs")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title={msg("Games solved on the first guess")} personalHeader={msg("Your Perfect Games")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title={msg("Invalid guesses (not in dictionary)")} personalHeader={msg("Your Invalid Guesses")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyCounterChartSkeleton title={msg("Valid guesses submitted")} personalHeader={msg("Your Valid Guesses")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title={msg("Average guesses to win")} personalHeader={msg("Your Average Guesses")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title={msg("Average time to solve a word")} personalHeader={msg("Your Average Time")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title={msg("Average score per arcade run")} personalHeader={msg("Your Average Score")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title={msg("Average streak per arcade run")} personalHeader={msg("Your Average Streak")} />
          </div>
          <div className="min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none">
            <AnyAvgStatChartSkeleton title={msg("Average run duration")} personalHeader={msg("Your Average Duration")} />
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
