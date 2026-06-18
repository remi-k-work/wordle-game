// react
import { Suspense } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { runPageMainOrNavigate } from "@/lib/helpers-effect";

// components
import { PageHeader } from "@/ui/page-header";
import { SectionHeader } from "@/ui/section-header";
import { Top10HighScores } from "@/features/high-score/ui/top-10-high-scores";
import { GuessDistributionChart } from "@/features/telemetry/ui/charts/guess-distribution";
import { TimeToSolveDistributionChart } from "@/features/telemetry/ui/charts/time-to-solve-distribution";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

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
      <section className="grid gap-3 xl:grid-cols-2">
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Guess Distribution
                <UsFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          <GuessDistributionChart solutionsLanguage="En" />
        </div>
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Guess Distribution
                <PlFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          <GuessDistributionChart solutionsLanguage="Pl" />
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Time to Solve Distribution
                <UsFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          <TimeToSolveDistributionChart solutionsLanguage="En" />
        </div>
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Time to Solve Distribution
                <PlFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          <TimeToSolveDistributionChart solutionsLanguage="Pl" />
        </div>
      </section>
    </article>
  );
}

function PageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score & Charts" description="The following section displays the top 10 scores, along with various informative game charts." />
      <section className="grid gap-3 xl:grid-cols-2">
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Guess Distribution
                <UsFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          &nbsp;
        </div>
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Guess Distribution
                <PlFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          &nbsp;
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Time to Solve Distribution
                <UsFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          &nbsp;
        </div>
        <div>
          <SectionHeader
            title={
              <span className="flex items-center justify-between gap-3">
                Time to Solve Distribution
                <PlFlagIcon className="size-11 shrink-0" />
              </span>
            }
          />
          &nbsp;
        </div>
      </section>
    </article>
  );
}
