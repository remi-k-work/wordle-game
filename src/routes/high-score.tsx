// tanstack
import { Suspense, lazy } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";

// services, features, and other libraries
import { Schema } from "effect";
import { msg } from "gt-tanstack-start";
import { HighScorePage } from "@/features/high-score/domain/models";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// components
import { PageHeader, PageHeaderSkeleton } from "@/ui/page-header";
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
// Skeletons live in dedicated recharts-free modules (see the per-module ./skeleton
// files) so this statically-bundled route chunk stays lean; the real chart sections
// import lazily below and stream in under their exact skeleton placeholders
import { BrowseChartsSkeleton } from "@/features/telemetry/ui/charts/browse-charts/skeleton";
import { BestRunTrophyCardChartSkeleton } from "@/features/telemetry/ui/charts/best-run-trophy-card/skeleton";
import { TotalsSliderSkeleton } from "@/features/telemetry/ui/charts/totals-slider/skeleton";
import { DistributionChartsSkeleton } from "@/features/telemetry/ui/charts/distributions/skeleton";
import { FrequencyChartsSkeleton } from "@/features/telemetry/ui/charts/frequencies/skeleton";

// Lazy chart sections (recharts, embla). Each one loads its own chunk via a concrete
// module path — a shared barrel import would fuse them all (plus every other section)
// into one chunk, so e.g. mounting the embla slider would also download recharts
const BrowseCharts = lazy(() => import("@/features/telemetry/ui/charts/browse-charts").then((m) => ({ default: m.BrowseCharts })));
const BestRunTrophyCardChart = lazy(() =>
  import("@/features/telemetry/ui/charts/best-run-trophy-card").then((m) => ({ default: m.BestRunTrophyCardChart }))
);
const TotalsSlider = lazy(() => import("@/features/telemetry/ui/charts/totals-slider").then((m) => ({ default: m.TotalsSlider })));
const DistributionCharts = lazy(() =>
  import("@/features/telemetry/ui/charts/distributions").then((m) => ({ default: m.DistributionCharts }))
);
const FrequencyCharts = lazy(() => import("@/features/telemetry/ui/charts/frequencies").then((m) => ({ default: m.FrequencyCharts })));

export const Route = createFileRoute("/high-score")({
  // The same page schema the Effect page-main validated next.js route inputs against.
  // validateSearch only extracts the typed URL state (without throwing: router-core turns
  // errors thrown here into SearchParamError, not a 404); the strict decode — and the hard
  // 404 on invalid `?sl=`, mirroring InvalidPageInputsError → notFound() — happens in the loader
  validateSearch: (search: { sl?: unknown }) => ({
    sl: typeof search.sl === "string" ? search.sl : undefined,
  }),

  // `search` is not provided to loaders (router-core demotivates shortcutting it);
  // loaderDeps threads the solutions language through, and re-runs the loader on change
  loaderDeps: ({ search: { sl } }) => ({ sl }),

  loader: ({ deps }) => {
    try {
      const {
        searchParams: { sl },
      } = Schema.decodeUnknownSync(HighScorePage)({ params: {}, searchParams: { sl: deps.sl } });
      return { sl } as const;
    } catch {
      throw notFound();
    }
  },

  head: () => ({
    meta: [{ title: "Wordle Overdrive ► High Score" }],
  }),

  component: HighScore,
});

function HighScore() {
  const { sl } = Route.useLoaderData();
  return (
    // Page remains the fast, static shell
    <Suspense fallback={<PageSkeleton />}>
      <PageContent solutionsLanguage={sl} />
    </Suspense>
  );
}

function PageContent({ solutionsLanguage }: { solutionsLanguage: SolutionsLanguage }) {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader
        title={msg("High Score & Charts")}
        description={msg("The following section displays the top 10 scores, along with various informative game charts.")}
      />
      <Suspense fallback={<BrowseChartsSkeleton />}>
        <BrowseCharts />
      </Suspense>
      <Top10HighScores solutionsLanguage={solutionsLanguage} />
      <Suspense fallback={<BestRunTrophyCardChartSkeleton />}>
        <BestRunTrophyCardChart solutionsLanguage={solutionsLanguage} />
      </Suspense>
      <Suspense fallback={<TotalsSliderSkeleton />}>
        <TotalsSlider solutionsLanguage={solutionsLanguage} />
      </Suspense>
      <Suspense fallback={<DistributionChartsSkeleton />}>
        <DistributionCharts solutionsLanguage={solutionsLanguage} />
      </Suspense>
      <Suspense fallback={<FrequencyChartsSkeleton />}>
        <FrequencyCharts solutionsLanguage={solutionsLanguage} />
      </Suspense>
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
