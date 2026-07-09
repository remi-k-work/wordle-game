// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <Button className="button" onClick={() => gameSettingsMachineEvent({ type: "solutionsLanguageToggled" })}>
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
