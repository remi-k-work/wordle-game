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
    <Button className="button p-1" title="Switch Solutions Language" onClick={() => gameSettingsMachineEvent({ type: "solutionsLanguageToggled" })}>
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
    </Button>
  );
}

export function LangChangerSkeleton() {
  return (
    <Button className="button p-1" title="Switch Solutions Language" disabled>
      <UsFlagIcon className="size-11" />
    </Button>
  );
}
