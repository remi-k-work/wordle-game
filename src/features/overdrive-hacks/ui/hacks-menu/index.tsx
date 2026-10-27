// services, features, and other libraries
import { Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  overdriveHacksCanApplyHackAtom,
  overdriveHacksIsApplyingOverrideAtom,
  overdriveHacksMachineAtom,
  overdriveHacksTheOverrideAtom,
} from "@/features/overdrive-hacks/state/overdrive-hacks";
import { modalMachineAtom } from "@/state/modal";
import { T, Var, useGT } from "gt-react";
import { useLocale } from "gt-tanstack-start";

// components
import { Button } from "@base-ui/react/button";
import { GamePopover } from "@/ui/game-popover";

// assets
import { SpinnerIcon } from "@/assets/icons/spinner";
import { LifebuoyIcon, SparklesIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentType, ReactNode } from "react";

interface HackActionProps {
  Icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  badge: ReactNode;
  disabled?: boolean;
  onClicked: () => void;
}

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// EMP is a proper noun (kept verbatim); Sonar is translated
const HACKS = [
  { id: "emp", label: "EMP", Icon: LifebuoyIcon },
  { id: "sonar", label: <T>Sonar</T>, Icon: LifebuoyIcon },
] as const;

function HackCostBadge({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">{children}</span>;
}

// One row of the hacks menu: icon | label | badge; the emp/sonar entries and both AI Override states all render this same shape
function HackAction({ Icon, label, badge, disabled = false, onClicked }: HackActionProps) {
  return (
    <Button className="button grid grid-cols-[auto_1fr_1fr]" disabled={disabled} onClick={onClicked}>
      <Icon className="size-11" />
      <span className="justify-self-start">{label}</span>
      {badge}
    </Button>
  );
}

export function HacksMenu() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  const canApplyHackEmp = useAtomValue(overdriveHacksCanApplyHackAtom("emp"));
  const canApplyHackSonar = useAtomValue(overdriveHacksCanApplyHackAtom("sonar"));
  const canApplyHackOverride = useAtomValue(overdriveHacksCanApplyHackAtom("override"));

  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  const isOverrideHackLoading = useAtomValue(overdriveHacksIsApplyingOverrideAtom);
  const isOverrideHackReady = Option.isSome(theOverride);

  const gt = useGT();
  const locale = useLocale();
  const canApplyById = { emp: canApplyHackEmp, sonar: canApplyHackSonar } as const;

  return (
    <GamePopover title={gt("Overdrive Hacks")} trigger={<LifebuoyIcon className="size-11" />}>
      {(close) => {
        // The AI Override has two modes of operation: claim the generated override, or buy one from the hacks menu; both render the same row
        const overrideAction = isOverrideHackReady
          ? {
              Icon: SparklesIcon,
              badge: (
                <span className="rounded-md bg-tile-green px-3 py-2 font-sans text-text-2">
                  <T>Ready ↗</T>
                </span>
              ),
              disabled: false,
              onClicked: () => {
                modalMachineEvent({ type: "opened", modalType: "override-hack" });
                close();
              },
            }
          : {
              Icon: isOverrideHackLoading ? SpinnerIcon : SparklesIcon,
              badge: (
                <HackCostBadge>
                  <Var>-{OVERDRIVE_HACK_COST("override").toLocaleString(locale)}</Var> <T>pts</T>
                </HackCostBadge>
              ),
              disabled: !canApplyHackOverride || isOverrideHackLoading,
              onClicked: () => overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "override" }),
            };

        return (
          <>
            {HACKS.map(({ id, label, Icon }) => (
              <HackAction
                key={id}
                Icon={Icon}
                label={label}
                badge={
                  <HackCostBadge>
                    <Var>-{OVERDRIVE_HACK_COST(id).toLocaleString(locale)}</Var> <T>pts</T>
                  </HackCostBadge>
                }
                disabled={!canApplyById[id]}
                onClicked={() => {
                  overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: id });
                  close();
                }}
              />
            ))}
            <HackAction
              Icon={overrideAction.Icon}
              label={<T>AI Override</T>}
              badge={overrideAction.badge}
              disabled={overrideAction.disabled}
              onClicked={overrideAction.onClicked}
            />
          </>
        );
      }}
    </GamePopover>
  );
}

export function HacksMenuSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <LifebuoyIcon className="size-11" />
    </Button>
  );
}
