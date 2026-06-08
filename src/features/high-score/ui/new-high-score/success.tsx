// assets
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export function Success() {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-start">
      <CheckCircleIcon className="size-11" />
      <p>
        Score recorded!
        <br />
        Good luck on your next run.
      </p>
    </div>
  );
}
