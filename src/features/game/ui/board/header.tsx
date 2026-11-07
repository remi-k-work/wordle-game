// components
import { Run, RunSkeleton } from "@/features/game/ui/run";
import { PotentialScore, PotentialScoreSkeleton } from "@/features/game/ui/potential-score";
import { GameMenu, GameMenuSkeleton } from "@/features/game/ui/menu";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// The live header and its skeleton render the same shell; only the sections
// they fill it with differ, so the shell is stated once

// Fully static class string, hoisted so neither variant re-runs it through twMerge
const HEADER_CLASSES = cn("flex items-center justify-between gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent");

export function Header() {
  return (
    <header className={HEADER_CLASSES}>
      <Run />
      <PotentialScore />
      <GameMenu />
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className={HEADER_CLASSES}>
      <RunSkeleton />
      <PotentialScoreSkeleton />
      <GameMenuSkeleton />
    </header>
  );
}
