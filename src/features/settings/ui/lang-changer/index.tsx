// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { T, useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { PlFlagIcon } from "@/assets/icons/pl-flag";
import { UsFlagIcon } from "@/assets/icons/us-flag";

// types
interface GameLangChangerProps {
  keepText?: boolean;
  onClicked?: () => void;
}

// Switches the *game vocabulary* (which word list the puzzles are drawn from)
// Deliberately not called `LangChanger`: the header ships a different control
// of the same name that switches the website locale (see @/ui/header/lang-changer)
export function GameLangChanger({ keepText = false, onClicked }: GameLangChangerProps) {
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

export function GameLangChangerSkeleton({ keepText = false }: Pick<GameLangChangerProps, "keepText">) {
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
