// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";
import { Top10HighScores } from "@/features/high-score/ui/top-10-high-scores";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <Top10HighScores solutionsLanguage={solutionsLanguage} />

      <Button tabIndex={-1} className="button mx-auto mt-8" onClick={() => modalMachineEvent({ type: "closed" })}>
        <XCircleIcon className="size-11" />
        Close
      </Button>
    </article>
  );
}
