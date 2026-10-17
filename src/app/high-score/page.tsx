// oxlint-disable effecttsgo/async-function

// react
import { Suspense } from "react";

// next
import dynamic from "next/dynamic";

// services, features, and other libraries
import { Effect } from "effect";
import { msg } from "gt-next";
import { runPageMainOrNavigate, validatePageInputs } from "@/domain/helpers";
import { HighScorePage } from "@/features/high-score/domain/models";

// components
import { PageHeader, PageHeaderSkeleton } from "@/ui/page-header";
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
import { BrowseChartsSkeleton } from "@/features/telemetry/ui/charts/browse-charts";
import { BestRunTrophyCardChartSkeleton } from "@/features/telemetry/ui/charts/best-run-trophy-card";
import { TotalsSliderSkeleton } from "@/features/telemetry/ui/charts/totals-slider";
import { DistributionChartsSkeleton } from "@/features/telemetry/ui/charts/distributions";
import { FrequencyChartsSkeleton } from "@/features/telemetry/ui/charts/frequencies";

// Each heavy chart section (recharts, embla) loads its own chunk via a
// concrete module path — a shared barrel import would fuse them all (plus
// every other section) into one chunk, so e.g. mounting the embla slider
// would also download recharts
const BrowseCharts = dynamic(() => import("@/features/telemetry/ui/charts/browse-charts").then((m) => m.BrowseCharts), {
  loading: () => <BrowseChartsSkeleton />,
});
const BestRunTrophyCardChart = dynamic(() => import("@/features/telemetry/ui/charts/best-run-trophy-card").then((m) => m.BestRunTrophyCardChart), {
  loading: () => <BestRunTrophyCardChartSkeleton />,
});
const TotalsSlider = dynamic(() => import("@/features/telemetry/ui/charts/totals-slider").then((m) => m.TotalsSlider), {
  loading: () => <TotalsSliderSkeleton />,
});
const DistributionCharts = dynamic(() => import("@/features/telemetry/ui/charts/distributions").then((m) => m.DistributionCharts), {
  loading: () => <DistributionChartsSkeleton />,
});
const FrequencyCharts = dynamic(() => import("@/features/telemetry/ui/charts/frequencies").then((m) => m.FrequencyCharts), {
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
