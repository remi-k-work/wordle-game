// components
import { RunScore } from "@/ui/modals/win-or-lose/run-score";

export function Content() {
  return (
    <article className="mx-auto max-w-prose space-y-4">
      <p className="mx-auto text-center text-xl">Are you sure you want to give up?</p>
      <RunScore />
    </article>
  );
}
