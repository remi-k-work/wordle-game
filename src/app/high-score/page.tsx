// react
import { Suspense } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { runPageMainOrNavigate } from "@/lib/helpers-effect";

// components
import { PageHeader } from "@/ui/page-header";
import { Top10HighScores } from "@/features/high-score/ui/top-10-high-scores";
import {
  AnyCounterCharts,
  AnyCounterChartsSkeleton,
  ArcadeStreakDistributionCharts,
  ArcadeStreakDistributionChartsSkeleton,
  FailedWordsFrequencyCharts,
  FailedWordsFrequencyChartsSkeleton,
  GuessDistributionCharts,
  GuessDistributionChartsSkeleton,
  OpeningGuessesFrequencyCharts,
  OpeningGuessesFrequencyChartsSkeleton,
  RunDeathReasonFrequencyCharts,
  RunDeathReasonFrequencyChartsSkeleton,
  TimeToSolveDistributionCharts,
  TimeToSolveDistributionChartsSkeleton,
} from "@/features/telemetry/ui/charts";

// types
import type { Metadata } from "next";

// constants
export const metadata: Metadata = {
  title: "Wordle Overdrive ► High Score",
};

const main = Effect.gen(function* () {
  const highScoreDB = yield* HighScoreDB;
  return yield* highScoreDB.top10HighScores;
});

// Page remains the fast, static shell
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}

// This new async component contains the dynamic logic
async function PageContent() {
  // Execute the main effect for the page, map known errors to the subsequent navigation helpers, and return the payload
  const top10HighScores = await runPageMainOrNavigate(main);

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <Top10HighScores top10HighScores={top10HighScores} />
      <GuessDistributionCharts />
      <TimeToSolveDistributionCharts />
      <ArcadeStreakDistributionCharts />
      <OpeningGuessesFrequencyCharts />
      <FailedWordsFrequencyCharts />
      <RunDeathReasonFrequencyCharts />
      <AnyCounterCharts title="Total number of games played (both won and lost)" counterName="gamesPlayed" personalHeader="Your Games" />
      <AnyCounterCharts title="Total number of arcade runs started" counterName="runsStarted" personalHeader="Your Runs" />
      <AnyCounterCharts title="Total number of games won on the first try" counterName="perfectGames" personalHeader="Your Perfect Games" />
      <AnyCounterCharts title="Total number of invalid guesses (not in dictionary)" counterName="invalidGuesses" personalHeader="Your Invalid Guesses" />
      <AnyCounterCharts title="Total number of valid guesses submitted" counterName="validGuesses" personalHeader="Your Valid Guesses" />
    </article>
  );
}

function PageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <GuessDistributionChartsSkeleton />
      <TimeToSolveDistributionChartsSkeleton />
      <ArcadeStreakDistributionChartsSkeleton />
      <OpeningGuessesFrequencyChartsSkeleton />
      <FailedWordsFrequencyChartsSkeleton />
      <RunDeathReasonFrequencyChartsSkeleton />
      <AnyCounterChartsSkeleton title="Total number of games played (both won and lost)" />
      <AnyCounterChartsSkeleton title="Total number of arcade runs started" />
      <AnyCounterChartsSkeleton title="Total number of games won on the first try" />
      <AnyCounterChartsSkeleton title="Total number of invalid guesses (not in dictionary)" />
      <AnyCounterChartsSkeleton title="Total number of valid guesses submitted" />
    </article>
  );
}
