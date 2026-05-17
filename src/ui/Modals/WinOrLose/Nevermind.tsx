// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { theSecretWordAtom, startNewRunAction, lastRunScoreAtom, lastRunStreakAtom } from "@/atoms";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const lastRunScore = useAtomValue(lastRunScoreAtom);
  const lastRunStreak = useAtomValue(lastRunStreakAtom);
  const startNewRun = useAtomSet(startNewRunAction);

  return (
    <article className="max-w-prose space-y-4">
      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <p>Better luck next time 😄</p>

      <section className="grid grid-cols-2 gap-4 rounded-xl border bg-secondary p-4">
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Score</h3>
          <span className="text-3xl font-semibold text-accent">{lastRunScore}</span>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Streak</h3>
          <span className="text-3xl font-semibold text-destructive">{lastRunStreak}</span>
        </div>
      </section>

      <Button className="button mx-auto" onClick={() => startNewRun()}>
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    </article>
  );
}
