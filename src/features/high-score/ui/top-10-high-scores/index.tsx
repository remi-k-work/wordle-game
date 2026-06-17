// services, features, and other libraries
import { HighScore } from "@/features/high-score/domain";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/shared/table";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
interface Top10HighScoresProps {
  top10HighScores: ReadonlyArray<HighScore>;
}

export function Top10HighScores({ top10HighScores }: Top10HighScoresProps) {
  if (top10HighScores.length === 0) return <InfoLine message="No High Scores yet!" />;

  return (
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
        {top10HighScores.map(({ playerName, score, streak, solutionsLang }, index: number) => (
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
  );
}
