// react
import { useState } from "react";

// services, features, and other libraries
import { useAtomValue, useAtomSet, useAtom, Result } from "@effect-atom/atom-react";
import { theSecretWordAtom, startNewRunAction, lastRunScoreAtom, lastStreakAtom, qualifiesForHighScoreAtom, addHighScoreAction } from "@/atoms";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function Nevermind() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const lastRunScore = useAtomValue(lastRunScoreAtom);
  const lastStreak = useAtomValue(lastStreakAtom);
  const qualifiesForHighScore = useAtomValue(qualifiesForHighScoreAtom);
  const [addHighScoreResult, addHighScore] = useAtom(addHighScoreAction);
  const startNewRun = useAtomSet(startNewRunAction);

  const [initials, setInitials] = useState("");

  const handleSubmit = () => {
    if (initials.length !== 3) return;
    addHighScore({ playerName: initials.toUpperCase(), score: lastRunScore, streak: lastStreak });
  };

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
          <span className="text-3xl font-semibold text-destructive">{lastStreak}</span>
        </div>
      </section>

      {qualifiesForHighScore && Result.isInitial(addHighScoreResult) && (
        <section className="animate-in fade-in zoom-in space-y-4 rounded-xl border-2 border-accent bg-accent/5 p-4 duration-300">
          <div className="flex items-center gap-2 text-accent">
            <TrophyIcon className="size-6" />
            <h3 className="font-bold tracking-tight uppercase">New High Score!</h3>
          </div>
          <p className="text-sm">You qualified for the Top 10. Enter your arcade initials:</p>
          <div className="flex gap-2">
            <input
              className="bg-background w-24 rounded border p-2 text-center text-2xl font-bold tracking-widest uppercase outline-none focus:ring-2 focus:ring-accent"
              maxLength={3}
              placeholder="AAA"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
              disabled={addHighScoreResult.waiting}
            />
            <Button className="button bg-accent text-white" onClick={handleSubmit} disabled={initials.length !== 3 || addHighScoreResult.waiting}>
              {addHighScoreResult.waiting ? "Saving..." : "Submit"}
            </Button>
          </div>
        </section>
      )}

      {Result.isSuccess(addHighScoreResult) && (
        <p className="animate-in fade-in text-center font-bold text-accent duration-500">Score recorded! Good luck on your next run.</p>
      )}

      <Button className="button mx-auto" onClick={() => startNewRun()}>
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    </article>
  );
}
