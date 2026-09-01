// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
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
      title={gt("Switch Game Vocabulary Language")}
      onClick={() => {
        gameSettingsMachineEvent({ type: "solutionsLanguageToggled" });
        onClicked?.();
      }}
    >
      {Match.value(solutionsLanguage).pipe(
        Match.when("En", () => <UsFlagIcon className="size-11" />),
        Match.when("Pl", () => <PlFlagIcon className="size-11" />),
        Match.exhaustive
      )}
      {keepText ? (
        <T>Game Language</T>
      ) : (
        <span className="hidden sm:block">
          <T>Game Language</T>
        </span>
      )}
    </Button>
  );
}

export function LangChangerSkeleton({ keepText = false }: LangChangerProps) {
  const gt = useGT();

  return (
    <Button className={cn("button", !keepText && "max-sm:p-1")} title={gt("Switch Game Vocabulary Language")} disabled>
      <div className="size-11 animate-pulse bg-accent" />
      {keepText ? (
        <T>Game Language</T>
      ) : (
        <span className="hidden sm:block">
          <T>Game Language</T>
        </span>
      )}
    </Button>
  );
}
