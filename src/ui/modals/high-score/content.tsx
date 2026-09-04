// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// components
import { Top10HighScores } from "@/features/high-score/ui/top-10-high-scores";
import { CloseModalButton } from "@/ui/modal-close-button";

export function Content() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <Top10HighScores solutionsLanguage={solutionsLanguage} />

      <CloseModalButton />
    </article>
  );
}
