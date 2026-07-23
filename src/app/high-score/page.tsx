// react
import { Suspense } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { runPageMainOrNavigate, validatePageInputs } from "@/lib/helpers-effect";
import { HighScorePage } from "@/features/high-score/domain";

// components
import { PageHeader } from "@/ui/page-header";
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
import {
  AnyCounterChart,
  AnyCounterChartSkeleton,
  BrowseCharts,
  BrowseChartsSkeleton,
  DistributionCharts,
  DistributionChartsSkeleton,
  FailedWordsFrequencyChart,
  FailedWordsFrequencyChartSkeleton,
  OpeningGuessesFrequencyChart,
  OpeningGuessesFrequencyChartSkeleton,
  RunDeathReasonFrequencyChart,
  RunDeathReasonFrequencyChartSkeleton,
} from "@/features/telemetry/ui/charts";

// types
import type { Metadata } from "next";

// constants
export const metadata: Metadata = {
  title: "Wordle Overdrive ► High Score",
};

const main = ({ params, searchParams }: PageProps<"/high-score">) =>
  Effect.gen(function* () {
    // Safely validate next.js route inputs (`params` and `searchParams`) against a schema; return typed data or trigger a 404 on failure
    const {
      searchParams: { sl },
    } = yield* validatePageInputs(HighScorePage, { params, searchParams });

    const highScoreDB = yield* HighScoreDB;
    const top10HighScores = yield* highScoreDB.top10HighScores;

    return { sl, top10HighScores } as const;
  });

// Page remains the fast, static shell
export default function Page({ params, searchParams }: PageProps<"/high-score">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

// This new async component contains the dynamic logic
async function PageContent({ params, searchParams }: PageProps<"/high-score">) {
  // Execute the main effect for the page, map known errors to the subsequent navigation helpers, and return the payload
  const { sl, top10HighScores } = await runPageMainOrNavigate(main({ params, searchParams }));

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <Top10HighScores top10HighScores={top10HighScores} />
      <BrowseCharts />
      <DistributionCharts solutionsLanguage={sl} />
      <OpeningGuessesFrequencyChart solutionsLanguage={sl} />
      <FailedWordsFrequencyChart solutionsLanguage={sl} />
      <RunDeathReasonFrequencyChart solutionsLanguage={sl} />
      <AnyCounterChart counterName="gamesPlayed" solutionsLanguage={sl} title="Total number of games played (both won and lost)" personalHeader="Your Games" />
      <AnyCounterChart counterName="runsStarted" solutionsLanguage={sl} title="Total number of arcade runs started" personalHeader="Your Runs" />
      <AnyCounterChart
        counterName="perfectGames"
        solutionsLanguage={sl}
        title="Total number of games won on the first try"
        personalHeader="Your Perfect Games"
      />
      <AnyCounterChart
        counterName="invalidGuesses"
        solutionsLanguage={sl}
        title="Total number of invalid guesses (not in dictionary)"
        personalHeader="Your Invalid Guesses"
      />
      <AnyCounterChart counterName="validGuesses" solutionsLanguage={sl} title="Total number of valid guesses submitted" personalHeader="Your Valid Guesses" />
    </article>
  );
}

function PageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <Top10HighScoresSkeleton />
      <BrowseChartsSkeleton />
      <DistributionChartsSkeleton />
      <OpeningGuessesFrequencyChartSkeleton />
      <FailedWordsFrequencyChartSkeleton />
      <RunDeathReasonFrequencyChartSkeleton />
      <AnyCounterChartSkeleton title="Total number of games played (both won and lost)" personalHeader="Your Games" />
      <AnyCounterChartSkeleton title="Total number of arcade runs started" personalHeader="Your Runs" />
      <AnyCounterChartSkeleton title="Total number of games won on the first try" personalHeader="Your Perfect Games" />
      <AnyCounterChartSkeleton title="Total number of invalid guesses (not in dictionary)" personalHeader="Your Invalid Guesses" />
      <AnyCounterChartSkeleton title="Total number of valid guesses submitted" personalHeader="Your Valid Guesses" />
    </article>
  );
}
