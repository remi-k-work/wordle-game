// services, features, and other libraries
import { useAtom, useAtomSet } from "@effect-atom/atom-react";
import { forfeitRunAction, solutionsLanguageAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const [solutionsLanguage, setSolutionsLanguage] = useAtom(solutionsLanguageAtom);
  const forfeitRun = useAtomSet(forfeitRunAction);

  function handleLangToggled() {
    setSolutionsLanguage(solutionsLanguage === "En" ? { solutionsLanguage: "Pl" } : { solutionsLanguage: "En" });
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
