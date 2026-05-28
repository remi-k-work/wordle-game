// components
import { Run, RunSkeleton } from "@/features/game/ui/Run";
import { PotentialScore, PotentialScoreSkeleton } from "@/features/game/ui/PotentialScore";
import { Riddle, RiddleSkeleton } from "@/features/game/ui/Riddle";
import { GameMenu, GameMenuSkeleton } from "@/features/game/ui/Menu";

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
