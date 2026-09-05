// services, features, and other libraries
import { T } from "gt-next";

// components
import { TableHead, TableHeader, TableRow } from "@/ui/table";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function Top10TableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        <TableHead className="w-32">
          <T>Name</T>
        </TableHead>
        <TableHead className="w-32 bg-accent/30 text-accent">
          <TrophyIcon className="mx-auto size-11" />
        </TableHead>
        <TableHead className="w-24 bg-destructive/30 text-destructive">
          <FireIcon className="mx-auto size-11" />
        </TableHead>
        <TableHead className="w-24">&nbsp;</TableHead>
      </TableRow>
    </TableHeader>
  );
}
