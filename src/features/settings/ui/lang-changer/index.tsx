// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
interface LangChangerProps {
  keepText?: boolean;
  onClicked?: () => void;
}

export function LangChanger({ keepText = false, onClicked }: LangChangerProps) {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <Button
      className={cn("button", !keepText && "max-sm:p-1")}
      title="Switch Solutions Language"
      onClick={() => {
        gameSettingsMachineEvent({ type: "solutionsLanguageToggled" });
        onClicked?.();
      }}
    >
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
      {keepText ? "Language" : <span className="hidden sm:block">Language</span>}
    </Button>
  );
}

export function LangChangerSkeleton({ keepText = false }: LangChangerProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1")} title="Switch Solutions Language" disabled>
      <div className="size-11 animate-pulse bg-accent" />
      {keepText ? "Language" : <span className="hidden sm:block">Language</span>}
    </Button>
  );
}
