// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// components
import { Button } from "@base-ui/react";
import { T, useGT } from "gt-next";

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
  const gt = useGT();

  return (
    <Button
      className={cn("button", !keepText && "max-sm:p-1")}
      title={gt("Switch game vocabulary language")}
      onClick={() => {
        gameSettingsMachineEvent({ type: "solutionsLanguageToggled" });
        onClicked?.();
      }}
    >
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
      {keepText ? (
        <T>Game language</T>
      ) : (
        <span className="hidden sm:block">
          <T>Game language</T>
        </span>
      )}
    </Button>
  );
}

export function LangChangerSkeleton({ keepText = false }: LangChangerProps) {
  const gt = useGT();

  return (
    <Button className={cn("button", !keepText && "max-sm:p-1")} title={gt("Switch game vocabulary language")} disabled>
      <div className="size-11 animate-pulse bg-accent" />
      {keepText ? (
        <T>Game language</T>
      ) : (
        <span className="hidden sm:block">
          <T>Game language</T>
        </span>
      )}
    </Button>
  );
}
