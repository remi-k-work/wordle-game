// services, features, and other libraries
import { Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { highScoreNewHighScoreIdAtom, top10HighScoresAtom } from "@/features/high-score/state";
import { modalMachineAtom } from "@/features/game/state";

// components
import { Top10HighScores, Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores";
import { Button } from "@base-ui/react";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const top10HighScores = useAtomValue(top10HighScoresAtom);
  const newHighScoreId = useAtomValue(highScoreNewHighScoreIdAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      {AsyncResult.builder(top10HighScores)
        .onInitialOrWaiting(() => <Top10HighScoresSkeleton />)
        .onFailure(() => <Top10HighScoresSkeleton />)
        .onSuccess((top10HighScores) => <Top10HighScores top10HighScores={top10HighScores} newHighScoreId={Option.getOrUndefined(newHighScoreId)} />)
        .render()}

      <Button tabIndex={-1} className="button mx-auto mt-8" onClick={() => modalMachineEvent({ type: "closed" })}>
        <XCircleIcon className="size-11" />
        Close
      </Button>
    </article>
  );
}
