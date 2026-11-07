// tanstack
import { Suspense, lazy } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";

// services, features, and other libraries
import { Option, Schema } from "effect";
import { msg } from "gt-react";
import { HighScorePage } from "@/features/high-score/domain/models";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// components
import { PageHeader } from "@/ui/page-header";
import { Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores/skeleton";

// Skeletons live in dedicated recharts-free modules (see the per-module ./skeleton
// files) so this statically-bundled route chunk stays lean; the real chart sections
// import lazily below and stream in under their exact skeleton placeholders
import { BrowseChartsSkeleton } from "@/features/charts/ui/browse-charts/skeleton";
import { BestRunTrophyCardChartSkeleton } from "@/features/charts/ui/best-run-trophy-card/skeleton";
import { TotalsSliderSkeleton } from "@/features/charts/ui/totals-slider/skeleton";
import { DistributionChartsSkeleton } from "@/features/charts/ui/distribution-charts/skeleton";
import { FrequencyChartsSkeleton } from "@/features/charts/ui/frequency-charts/skeleton";
import { FooterLink } from "@/ui/footer-link";

// Lazy chart sections (recharts, embla). Each one loads its own chunk via a concrete
// module path — a shared barrel import would fuse them all (plus every other section)
// into one chunk, so e.g. mounting the embla slider would also download recharts
const BrowseCharts = lazy(() => import("@/features/charts/ui/browse-charts").then((m) => ({ default: m.BrowseCharts })));
const BestRunTrophyCardChart = lazy(() => import("@/features/charts/ui/best-run-trophy-card").then((m) => ({ default: m.BestRunTrophyCardChart })));
const TotalsSlider = lazy(() => import("@/features/charts/ui/totals-slider").then((m) => ({ default: m.TotalsSlider })));
const DistributionCharts = lazy(() => import("@/features/charts/ui/distribution-charts").then((m) => ({ default: m.DistributionCharts })));
const FrequencyCharts = lazy(() => import("@/features/charts/ui/frequency-charts").then((m) => ({ default: m.FrequencyCharts })));

// The top-10 table lazily loads too: its module pulls in the motion runtime, which
// would otherwise land in this statically-bundled route chunk (bundle-dynamic-imports)
const Top10HighScores = lazy(() => import("@/features/high-score/ui/top-10-high-scores").then((m) => ({ default: m.Top10HighScores })));

export const Route = createFileRoute("/high-score")({
  // The same page schema that validates the route inputs
  // validateSearch only extracts the typed URL state (without throwing: router-core turns
  // errors thrown here into SearchParamError, not a 404); the strict decode — and the hard
  // 404 on invalid `?sl=` — happens in the loader
  validateSearch: (search: { sl?: unknown }) => ({
    sl: typeof search.sl === "string" ? search.sl : undefined,
  }),

  // `search` is not provided to loaders (router-core demotivates shortcutting it);
  // loaderDeps threads the solutions language through, and re-runs the loader on change
  loaderDeps: ({ search: { sl } }) => ({ sl }),

  loader: ({ deps }) => {
    const page = Schema.decodeUnknownOption(HighScorePage)({ params: {}, searchParams: { sl: deps.sl } });
    if (Option.isNone(page)) throw notFound();
    return { sl: page.value.searchParams.sl } as const;
  },

  head: () => ({
    meta: [{ title: "Wordle Overdrive ► High Score" }],
  }),

  component: HighScore,
});

function HighScore() {
  const { sl } = Route.useLoaderData();
  // PageContent is synchronous; every lazily-loading section below carries its own
  // Suspense boundary, so no outer fallback is needed
  return <PageContent solutionsLanguage={sl} />;
}

// Each section owns its own Suspense boundary with the skeleton that matches its
// shape, so the page reads as a list of sections — each one streaming in under
// its own placeholder — without any wrapper component in between
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
      <Suspense fallback={<Top10HighScoresSkeleton />}>
        <Top10HighScores solutionsLanguage={solutionsLanguage} />
      </Suspense>
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
      <FooterLink />
    </article>
  );
}
