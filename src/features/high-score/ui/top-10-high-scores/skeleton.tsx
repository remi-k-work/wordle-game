// components
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import { Top10TableHeader } from "./top-10-table-header";

const TOP10_SKELETON_ROWS = [...Array(10)].map((_, index: number) => (
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
));

// The skeleton lives in this dedicated motion-free module so the statically-bundled
// /high-score route chunk stays lean; the real component lazily loads ./index
// (which pulls in motion) under this exact placeholder (see routes/high-score.tsx)
export function Top10HighScoresSkeleton() {
  return (
    <Table>
      <Top10TableHeader />
      <TableBody>{TOP10_SKELETON_ROWS}</TableBody>
    </Table>
  );
}
