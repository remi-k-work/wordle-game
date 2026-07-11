// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { highScoreMachineAtom } from "@/features/high-score/state";

// assets
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function Failure() {
  const highScoreMachineSnapshot = useAtomValue(highScoreMachineAtom);

  // Hide the entire component if there is no failure to report
  if (!highScoreMachineSnapshot.matches("failure")) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive px-2 py-1 text-start text-destructive">
      <ExclamationTriangleIcon className="size-11" />
      <p>Failed to save your score. Please try again.</p>
    </div>
  );
}
