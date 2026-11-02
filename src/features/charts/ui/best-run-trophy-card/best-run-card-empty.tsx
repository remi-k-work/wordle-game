// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { InfoLine } from "@/ui/info-line";

// assets
import { CalendarIcon, ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// Renders the "no data yet" state — a single centered info line
export function BestRunCardEmpty() {
  const gt = useGT();

  return <InfoLine className="row-span-6 font-normal" message={gt("No completed runs yet!")} />;
}

// Placeholder rows for the loading state — mirrors the filled state's structure
// without data, so the skeleton holds the same layout as the real card
export function BestRunCardEmptySkeleton() {
  return (
    <>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-accent">
        <TrophyIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-destructive">
        <FireIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere">
        <ClockIcon className="size-9" />
        &nbsp;
      </span>
      <h4 className="max-w-none place-self-end justify-self-center font-sans text-sm tracking-widest uppercase">&nbsp;</h4>
      <span className="text-3xl wrap-anywhere">&nbsp;</span>
      <span className="flex items-center gap-1 text-sm">
        <CalendarIcon className="size-6" />
        &nbsp;
      </span>
    </>
  );
}
