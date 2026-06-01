// services, features, and other libraries
import { useAtom, useAtomSet } from "@effect-atom/atom-react";
import { forfeitRunAction, gameSettingsAtom } from "@/features/game/state";
import { changeSolutionsLanguage } from "@/features/game/domain";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const [gameSettings, setGameSettings] = useAtom(gameSettingsAtom);
  const forfeitRun = useAtomSet(forfeitRunAction);

  const { solutionsLanguage } = gameSettings;

  function handleLangToggled() {
    setGameSettings(changeSolutionsLanguage(gameSettings));
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
