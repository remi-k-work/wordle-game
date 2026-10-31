// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state/modal";
import { T, useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";
import { GamePopover } from "@/ui/game-popover";
import { GameLangChanger } from "@/features/settings/ui/lang-changer";
import { GameFlowButton } from "@/features/game/ui/game-flow-button";

// assets
import { Bars3Icon, QuestionMarkCircleIcon, SpeakerWaveIcon, TrophyIcon } from "@heroicons/react/24/outline";

// constants
const MENU_MODALS = [
  { modalType: "voice-settings", label: <T>Voice Settings</T>, Icon: SpeakerWaveIcon },
  { modalType: "high-score", label: <T>High Score</T>, Icon: TrophyIcon },
  { modalType: "help", label: <T>Help</T>, Icon: QuestionMarkCircleIcon },
] as const;

export function GameMenu() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);
  const gt = useGT();

  return (
    <GamePopover title={gt("Menu")} trigger={<Bars3Icon className="size-11" />}>
      {(close) => (
        <>
          <GameLangChanger keepText onClicked={close} />
          <GameFlowButton keepText onClicked={close} />
          {MENU_MODALS.map(({ modalType, label, Icon }) => (
            <Button
              key={modalType}
              className="button"
              onClick={() => {
                modalMachineEvent({ type: "opened", modalType });
                close();
              }}
            >
              <Icon className="size-11" />
              {label}
            </Button>
          ))}
        </>
      )}
    </GamePopover>
  );
}

export function GameMenuSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <Bars3Icon className="size-11" />
    </Button>
  );
}
