// oxlint-disable effecttsgo/async-function

// react
import { Suspense } from "react";

// next
import dynamic from "next/dynamic";

// services, features, and other libraries
import { Effect } from "effect";
import { msg } from "gt-next";
import { runPageMainOrNavigate, validatePageInputs } from "@/domain/helpers";
import { HighScorePage } from "@/features/high-score/domain";

// components
import { PageHeader, PageHeaderSkeleton } from "@/ui/page-header";
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
import {
  BestRunTrophyCardChartSkeleton,
  BrowseChartsSkeleton,
  DistributionChartsSkeleton,
  FrequencyChartsSkeleton,
  TotalsSliderSkeleton,
} from "@/features/telemetry/ui/charts";

// Heavy chart sections (recharts, embla) are split into separate chunks, keeping
// them out of the initial bundle; each shows its existing skeleton while loading
const BrowseCharts = dynamic(() => import("@/features/telemetry/ui/charts").then((m) => m.BrowseCharts), {
  loading: () => <BrowseChartsSkeleton />,
});
const BestRunTrophyCardChart = dynamic(() => import("@/features/telemetry/ui/charts").then((m) => m.BestRunTrophyCardChart), {
  loading: () => <BestRunTrophyCardChartSkeleton />,
});
const TotalsSlider = dynamic(() => import("@/features/telemetry/ui/charts").then((m) => m.TotalsSlider), {
  loading: () => <TotalsSliderSkeleton />,
});
const DistributionCharts = dynamic(() => import("@/features/telemetry/ui/charts").then((m) => m.DistributionCharts), {
  loading: () => <DistributionChartsSkeleton />,
});
const FrequencyCharts = dynamic(() => import("@/features/telemetry/ui/charts").then((m) => m.FrequencyCharts), {
  loading: () => <FrequencyChartsSkeleton />,
});

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
      <PageHeader
        title={msg("High Score & Charts")}
        description={msg("The following section displays the top 10 scores, along with various informative game charts.")}
      />
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
        title={msg("High Score & Charts")}
        description={msg("The following section displays the top 10 scores, along with various informative game charts.")}
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
