// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { potentialScoreAtom } from "@/features/game/state";
import { potentialScoreAsPercentage } from "@/features/game/domain";

// components
import { Progress } from "@base-ui/react";

export function PotentialScore() {
  const potentialScore = useAtomValue(potentialScoreAtom);

  return (
    <section className="grid flex-1 place-items-center rounded-md border border-accent bg-surface-2 px-2 py-1">
      <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
      <span className="font-semibold tabular-nums sm:text-lg">{potentialScore}</span>
      <Progress.Root className="grid w-full" value={potentialScoreAsPercentage(potentialScore)}>
        <Progress.Track className="h-2 overflow-hidden rounded-sm border bg-linear-to-r from-destructive via-tile-yellow to-tile-green">
          <Progress.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 transition-[width] duration-1000 ease-in-out" />
        </Progress.Track>
      </Progress.Root>
    </section>
  );
}

export function PotentialScoreSkeleton() {
  return (
    <section className="grid flex-1 place-items-center rounded-md border border-accent bg-surface-2 px-2 py-1">
      <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
      <span className="font-semibold tabular-nums sm:text-lg">&nbsp;</span>
      <Progress.Root className="grid w-full" value={null}>
        <Progress.Track className="h-2 overflow-hidden rounded-sm border bg-linear-to-r from-destructive via-tile-yellow to-tile-green">
          <Progress.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 transition-[width] duration-1000 ease-in-out" />
        </Progress.Track>
      </Progress.Root>
    </section>
  );
}
