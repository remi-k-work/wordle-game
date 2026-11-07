// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { T, useGT } from "gt-react";

// components
import { GamePopover, PopoverTriggerSkeleton } from "@/ui/game-popover";
import { HackCost } from "./hack-cost";
import { HackAction } from "./hack-action";
import { OverrideHackAction } from "./override-hack-action";

// assets
import { LifebuoyIcon } from "@heroicons/react/24/outline";

// EMP is a proper noun (kept verbatim); Sonar is translated
const HACKS = [
  { id: "emp", label: "EMP", Icon: LifebuoyIcon },
  { id: "sonar", label: <T>Sonar</T>, Icon: LifebuoyIcon },
] as const;

// The menu lists the two always available hacks plus the AI Override, whose row
// carries its own two modes and state subscriptions (see ./override-hack-action):
// keeping that row out of here is what stops every override state change from
// re-rendering the whole menu
export function HacksMenu() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  const canApplyHackEmp = useAtomValue(overdriveHacksCanApplyHackAtom("emp"));
  const canApplyHackSonar = useAtomValue(overdriveHacksCanApplyHackAtom("sonar"));

  const gt = useGT();
  const canApplyById = { emp: canApplyHackEmp, sonar: canApplyHackSonar } as const;

  return (
    <GamePopover title={gt("Overdrive Hacks")} trigger={<LifebuoyIcon className="size-11" />}>
      {(close) => (
        <>
          {HACKS.map(({ id, label, Icon }) => (
            <HackAction
              key={id}
              Icon={Icon}
              label={label}
              badge={<HackCost hackId={id} />}
              disabled={!canApplyById[id]}
              onClicked={() => {
                overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: id });
                close();
              }}
            />
          ))}
          <OverrideHackAction onClicked={close} />
        </>
      )}
    </GamePopover>
  );
}

export function HacksMenuSkeleton() {
  return <PopoverTriggerSkeleton Icon={LifebuoyIcon} />;
}
