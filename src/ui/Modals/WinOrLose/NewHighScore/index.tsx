// services, features, and other libraries
import { useAtom, useAtomValue, Result } from "@effect-atom/atom-react";
import { addHighScoreAction, qualifiesForHighScoreAtom } from "@/atoms";

// components
import { Success } from "./Success";
import { Failure } from "./Failure";
import { Initials } from "./Initials";

// assets
import { TrophyIcon } from "@heroicons/react/24/outline";

export function NewHighScore() {
  const qualifiesForHighScore = useAtomValue(qualifiesForHighScoreAtom);
  const [addHighScoreResult, addHighScore] = useAtom(addHighScoreAction);

  // Hide the entire component if the player did not qualify
  if (!qualifiesForHighScore) return null;

  // Success replaces the form entirely
  if (Result.isSuccess(addHighScoreResult)) return <Success />;

  return (
    <section className="grid place-items-center gap-4 rounded-md border-2 border-accent p-4">
      <div className="flex items-center gap-2 text-accent">
        <TrophyIcon className="size-11" />
        <h3 className="font-sans text-2xl font-semibold tracking-widest text-accent uppercase sm:text-3xl">New High Score!</h3>
      </div>
      <p>
        You qualified for the Top 10.
        <br />
        Enter your arcade initials:
      </p>

      <Failure addHighScoreResult={addHighScoreResult} />
      <Initials addHighScoreResult={addHighScoreResult} addHighScore={addHighScore} />
    </section>
  );
}
