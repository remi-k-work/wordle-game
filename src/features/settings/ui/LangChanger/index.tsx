// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { changeSolutionsLanguageAction, solutionsLanguageAtom } from "@/features/settings/state";
import { forfeitRunAction } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);
  const changeSolutionsLanguage = useAtomSet(changeSolutionsLanguageAction);
  const forfeitRun = useAtomSet(forfeitRunAction);

  function handleLangToggled() {
    changeSolutionsLanguage();
    forfeitRun();
  }

  return (
    <Button className="button" onClick={handleLangToggled}>
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
      Language
    </Button>
  );
}

export function LangChangerSkeleton() {
  return (
    <Button className="button" disabled>
      <UsFlagIcon className="size-11" />
      Language
    </Button>
  );
}
