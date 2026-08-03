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
    <Button className="button max-sm:p-1" title="Switch Solutions Language" onClick={() => gameSettingsMachineEvent({ type: "solutionsLanguageToggled" })}>
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
      <span className="hidden sm:block">Language</span>
    </Button>
  );
}

export function LangChangerSkeleton() {
  return (
    <Button className="button max-sm:p-1" title="Switch Solutions Language" disabled>
      <div className="size-11 animate-pulse bg-accent" />
      <span className="hidden sm:block">Language</span>
    </Button>
  );
}
