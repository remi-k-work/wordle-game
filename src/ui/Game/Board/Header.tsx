// components
import { Run, RunSkeleton } from "@/ui/Game/Run";
import { PotentialScore, PotentialScoreSkeleton } from "@/ui/Game/PotentialScore";
import { Riddle, RiddleSkeleton } from "@/ui/Game/Riddle";
import { GameMenu, GameMenuSkeleton } from "@/ui/Game/Menu";

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
