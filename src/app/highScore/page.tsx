// react
import { Suspense } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { HighScoreDB } from "@/services/highScoreDB";
import { runPageMainOrNavigate } from "@/lib/helpersEffect";

// components
import { PageHeader } from "@/ui/PageHeader";
import { InfoLine } from "@/ui/Shared/InfoLine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/Shared/Table";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";
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

  if (top10HighScores.length === 0)
    return (
      <article className="mx-auto w-full max-w-384">
        <PageHeader title="High Score" description="Top 10 scores, sorted by score and streak." />
        <InfoLine message="No High Scores yet!" />
      </article>
    );

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score" description="Top 10 scores, sorted by score and streak." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="bg-accent/30 text-accent">
              <TrophyIcon className="mx-auto size-9 sm:size-11" />
            </TableHead>
            <TableHead className="bg-destructive/30 text-destructive">
              <FireIcon className="mx-auto size-9 sm:size-11" />
            </TableHead>
            <TableHead>&nbsp;</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10HighScores.map(({ playerName, score, streak, solutionsLang }, index) => (
            <TableRow key={index} className="odd:bg-surface-2">
              <TableCell>{index + 1}</TableCell>
              <TableCell>{playerName}</TableCell>
              <TableCell className="bg-accent/30">{score}</TableCell>
              <TableCell className="bg-destructive/30">{streak}</TableCell>
              <TableCell>{solutionsLang === "En" ? <UsFlagIcon className="mx-auto size-11" /> : <PlFlagIcon className="mx-auto size-11" />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  );
}

function PageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader title="High Score" description="Top 10 scores, sorted by score and streak." />
    </article>
  );
}
