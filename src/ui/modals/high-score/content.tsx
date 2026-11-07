// react
import { Suspense, lazy } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// components
import { Top10HighScoresSkeleton } from "@/features/high-score/ui/top-10-high-scores/skeleton";
import { ModalBody } from "@/ui/modal-body";

// The table (and the motion runtime its module drags in) is code-split: every modal
// ships in the root document chunk, so a static import here would load motion on
// every page (bundle-dynamic-imports). It mounts on modal open instead
const Top10HighScores = lazy(() => import("@/features/high-score/ui/top-10-high-scores").then((m) => ({ default: m.Top10HighScores })));

export function Content() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);

  return (
    <ModalBody>
      <Suspense fallback={<Top10HighScoresSkeleton />}>
        <Top10HighScores solutionsLanguage={solutionsLanguage} />
      </Suspense>
    </ModalBody>
  );
}
