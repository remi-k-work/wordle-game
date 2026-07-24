// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { InfoLine } from "@/ui/info-line";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { HighScore } from "@/features/high-score/domain";

interface Top10HighScoresProps {
  top10HighScores: ReadonlyArray<HighScore>;
  newHighScoreId?: HighScore["id"];
}

export function Top10HighScores({ top10HighScores, newHighScoreId }: Top10HighScoresProps) {
  if (top10HighScores.length === 0) return <InfoLine message="No High Scores yet!" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead className="w-32">Name</TableHead>
          <TableHead className="w-32 bg-accent/30 text-accent">
            <TrophyIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24 bg-destructive/30 text-destructive">
            <FireIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {top10HighScores.map(({ id, playerName, score, streak, solutionsLang }, index: number) => (
          <TableRow key={id} className={cn("odd:bg-surface-2", id === newHighScoreId && "animate-wiggle bg-accent odd:bg-accent")}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{playerName}</TableCell>
            <TableCell className="bg-accent/30">{score.toLocaleString()}</TableCell>
            <TableCell className="bg-destructive/30">{streak.toLocaleString()}</TableCell>
            <TableCell>{solutionsLang === "En" ? <UsFlagIcon className="mx-auto size-11" /> : <PlFlagIcon className="mx-auto size-11" />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Top10HighScoresSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead className="w-32">Name</TableHead>
          <TableHead className="w-32 bg-accent/30 text-accent">
            <TrophyIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24 bg-destructive/30 text-destructive">
            <FireIcon className="mx-auto size-11" />
          </TableHead>
          <TableHead className="w-24">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, index: number) => (
          <TableRow key={index} className="odd:bg-surface-2">
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <div className="mx-auto h-4 w-12 animate-pulse bg-accent" />
            </TableCell>
            <TableCell className="bg-accent/30">
              <div className="mx-auto h-4 w-16 animate-pulse bg-accent" />
            </TableCell>
            <TableCell className="bg-destructive/30">
              <div className="mx-auto h-4 w-8 animate-pulse bg-accent" />
            </TableCell>
            <TableCell>
              <div className="mx-auto size-11 animate-pulse bg-accent" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
