// components
import { Run, RunSkeleton } from "@/features/game/ui/run";
import { PotentialScore, PotentialScoreSkeleton } from "@/features/game/ui/potential-score";
import { Riddle, RiddleSkeleton } from "@/features/game/ui/riddle";
import { GameMenu, GameMenuSkeleton } from "@/features/game/ui/menu";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <Run />
      <PotentialScore />
      <Riddle />
      <GameMenu />
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <RunSkeleton />
      <PotentialScoreSkeleton />
      <RiddleSkeleton />
      <GameMenuSkeleton />
    </header>
  );
}
