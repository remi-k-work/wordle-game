// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { changeSolutionsLanguageAction, solutionsLanguageAtom } from "@/features/settings/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);
  const changeSolutionsLanguage = useAtomSet(changeSolutionsLanguageAction);

  return (
    <Button className="button" onClick={() => changeSolutionsLanguage()}>
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
