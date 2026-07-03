// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { runSessionBestRunScoreAtom, runSessionBestStreakAtom, runSessionLastRunScoreAtom, runSessionLastStreakAtom } from "@/features/game/state";

export function RunScore() {
  const lastRunScore = useAtomValue(runSessionLastRunScoreAtom);
  const lastStreak = useAtomValue(runSessionLastStreakAtom);
  const bestRunScore = useAtomValue(runSessionBestRunScoreAtom);
  const bestStreak = useAtomValue(runSessionBestStreakAtom);

  return (
    <section className="grid grid-cols-2 grid-rows-2 border">
      <div className="bg-surface-2 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Score</h3>
        <span className="text-3xl font-semibold text-accent">{lastRunScore}</span>
      </div>
      <div className="bg-surface-3 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Streak</h3>
        <span className="text-3xl font-semibold text-destructive">{lastStreak}</span>
      </div>
      <div className="bg-surface-3 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Best Run Score</h3>
        <span className="text-3xl font-semibold text-accent">{bestRunScore}</span>
      </div>
      <div className="bg-surface-2 p-3">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Best Streak</h3>
        <span className="text-3xl font-semibold text-destructive">{bestStreak}</span>
      </div>
    </section>
  );
}
