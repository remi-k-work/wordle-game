// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { runSessionRunScoreAtom, runSessionStreakAtom } from "@/features/game/state";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function Run() {
  const runScore = useAtomValue(runSessionRunScoreAtom);
  const streak = useAtomValue(runSessionStreakAtom);

  return (
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
  );
}

export function RunSkeleton() {
  return (
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
  );
}
