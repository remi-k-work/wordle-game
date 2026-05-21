// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { streakAtom, potentialScoreAtom, runScoreAtom } from "@/atoms";

// components
import { Riddle, RiddleSkeleton } from "@/ui/Game/Riddle";
import { GameMenu, GameMenuSkeleton } from "@/ui/Game/Menu";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function Header() {
  const runScore = useAtomValue(runScoreAtom);
  const streak = useAtomValue(streakAtom);
  const potentialScore = useAtomValue(potentialScoreAtom);

  return (
    <header className="flex items-center justify-between gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <section className="grid flex-2 place-items-center rounded-md border bg-secondary px-2 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run</h2>
        <div className="flex w-full items-center justify-around gap-2">
          <div className="flex items-center gap-1">
            <TrophyIcon className="size-6 text-accent sm:size-7" />
            <span className="text-lg font-semibold tabular-nums sm:text-2xl">{runScore}</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <FireIcon className="size-6 sm:size-7" />
            <span className="text-lg font-semibold tabular-nums sm:text-2xl">{streak}</span>
          </div>
        </div>
      </section>

      <section className="grid flex-1 place-items-center rounded-md border border-accent bg-surface-2 px-2 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
        <span className="text-xl font-semibold tabular-nums sm:text-2xl">{potentialScore}</span>
      </section>

      <Riddle />
      <GameMenu />
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <section className="grid flex-2 place-items-center rounded-md border bg-secondary px-2 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run</h2>
        <div className="flex w-full items-center justify-around gap-2">
          <div className="flex items-center gap-1">
            <TrophyIcon className="size-6 text-accent sm:size-7" />
            <span className="text-lg font-semibold tabular-nums sm:text-2xl">&nbsp;</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <FireIcon className="size-6 sm:size-7" />
            <span className="text-lg font-semibold tabular-nums sm:text-2xl">&nbsp;</span>
          </div>
        </div>
      </section>

      <section className="grid flex-1 place-items-center rounded-md border border-accent bg-surface-2 px-2 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
        <span className="text-xl font-semibold tabular-nums sm:text-2xl">&nbsp;</span>
      </section>

      <RiddleSkeleton />
      <GameMenuSkeleton />
    </header>
  );
}
