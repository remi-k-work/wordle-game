// react
import { Suspense } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { runPageMainOrNavigate, validatePageInputs } from "@/lib/helpers-effect";
import { HighScorePage } from "@/features/high-score/domain";

// components
import { PageHeader, PageHeaderSkeleton } from "@/ui/page-header";
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
import {
  BestRunTrophyCardChart,
  BestRunTrophyCardChartSkeleton,
  BrowseCharts,
  BrowseChartsSkeleton,
  DistributionCharts,
  DistributionChartsSkeleton,
  FrequencyCharts,
  FrequencyChartsSkeleton,
  TotalsSlider,
  TotalsSliderSkeleton,
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

    return { sl } as const;
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
  const { sl } = await runPageMainOrNavigate(main({ params, searchParams }));

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <BrowseCharts />
      <Top10HighScores solutionsLanguage={sl} />
      <BestRunTrophyCardChart solutionsLanguage={sl} />
      <TotalsSlider solutionsLanguage={sl} />
      <DistributionCharts solutionsLanguage={sl} />
      <FrequencyCharts solutionsLanguage={sl} />
    </article>
  );
}

function PageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeaderSkeleton
        title="High Score & Charts"
        description="The following section displays the top 10 scores, along with various informative game charts."
      />
      <BrowseChartsSkeleton />
      <Top10HighScoresSkeleton />
      <BestRunTrophyCardChartSkeleton />
      <TotalsSliderSkeleton />
      <DistributionChartsSkeleton />
      <FrequencyChartsSkeleton />
    </article>
  );
}
