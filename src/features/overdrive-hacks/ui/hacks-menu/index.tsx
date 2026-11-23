// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { requestOverdriveHackAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { T, useGT } from "gt-react";

// components
import { GamePopover, PopoverTriggerSkeleton } from "@/ui/game-popover";
import { HackCost } from "./hack-cost";
import { HackAction } from "./hack-action";
import { OverrideHackAction } from "./override-hack-action";

// types
import type { ComponentType, ReactNode } from "react";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

interface HacksMenuRowProps {
  id: OverdriveHackId;
  label: ReactNode;
  Icon: ComponentType<{ className?: string }>;
  // The menu owns its own visibility, so the row only reports that a hack was requested
  onRequested: () => void;
}

// assets
import { LifebuoyIcon } from "@heroicons/react/24/outline";

// EMP is a proper noun (kept verbatim); Sonar is translated
const HACKS = [
  { id: "emp", label: "EMP", Icon: LifebuoyIcon },
  { id: "sonar", label: <T>Sonar</T>, Icon: LifebuoyIcon },
] as const;

// Each row requests through the helper atom, which reads the current run score at
// send time; the row itself never assembles a domain event payload
function HacksMenuRow({ id, label, Icon, onRequested }: HacksMenuRowProps) {
  const requestHack = useAtomSet(requestOverdriveHackAtom(id));
  const canApplyHack = useAtomValue(overdriveHacksCanApplyHackAtom(id));

  return (
    <HackAction
      Icon={Icon}
      label={label}
      badge={<HackCost hackId={id} />}
      disabled={!canApplyHack}
      onClicked={() => {
        requestHack();
        onRequested();
      }}
    />
  );
}

// The menu lists the two always available hacks plus the AI Override, whose row
// carries its own two modes and state subscriptions (see ./override-hack-action):
// keeping that row out of here is what stops every override state change from
// re-rendering the whole menu
export function HacksMenu() {
  const gt = useGT();

  return (
    <GamePopover title={gt("Overdrive Hacks")} trigger={<LifebuoyIcon className="size-11" />}>
      {(close) => (
        <>
          {HACKS.map(({ id, label, Icon }) => (
            <HacksMenuRow key={id} id={id} label={label} Icon={Icon} onRequested={close} />
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
