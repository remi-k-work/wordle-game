// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { highScoreMachineAtom } from "@/features/high-score/state";

// components
import { Success } from "./success";
import { Failure } from "./failure";
import { Initials } from "./initials";

// assets
import { TrophyIcon } from "@heroicons/react/24/outline";

export function NewHighScore() {
  const highScoreMachineSnapshot = useAtomValue(highScoreMachineAtom);

  // Hide the entire component if the player did not qualify
  const isVisible = (["enteringInitials", "submitting", "failure", "success"] as const).some((state) => highScoreMachineSnapshot.matches(state));
  if (!isVisible) return null;

  // Success replaces the form entirely
  if (highScoreMachineSnapshot.matches("success")) return <Success />;

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

      <Failure />
      <Initials />
    </section>
  );
}
