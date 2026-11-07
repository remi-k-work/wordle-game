// assets
import { CalendarIcon, ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// Placeholder rows for the loading state
export function BestRunCardLoading() {
  return (
    <>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-accent">
        <TrophyIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-destructive">
        <FireIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere">
        <ClockIcon className="size-9" />
        &nbsp;
      </span>
      <h4 className="max-w-none place-self-end justify-self-center font-sans text-sm tracking-widest uppercase">&nbsp;</h4>
      <span className="text-3xl wrap-anywhere">&nbsp;</span>
      <span className="flex items-center gap-1 text-sm">
        <CalendarIcon className="size-6" />
        &nbsp;
      </span>
    </>
  );
}
