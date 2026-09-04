// react
import { useCallback, useState } from "react";

// services, features, and other libraries
import { Option } from "effect";
import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksCanApplyHackAtom, overdriveHacksMachineAtom, overdriveHacksTheOverrideAtom } from "@/features/overdrive-hacks/state";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";
import { T, Var, useGT, useLocale } from "gt-next";
import { GamePopover } from "@/ui/game-popover";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { LifebuoyIcon, SparklesIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain";

const HACKS = [
  { id: "emp", label: "EMP", translatable: false, Icon: LifebuoyIcon },
  { id: "sonar", label: "Sonar", translatable: true, Icon: LifebuoyIcon },
] as const;

function HackCostBadge({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">{children}</span>;
}

export function HacksMenu() {
  const [overdriveHacksMachineSnapshot, overdriveHacksMachineEvent] = useAtom(overdriveHacksMachineAtom);

  const canApplyHackEmp = useAtomValue(overdriveHacksCanApplyHackAtom("emp"));
  const canApplyHackSonar = useAtomValue(overdriveHacksCanApplyHackAtom("sonar"));
  const canApplyHackOverride = useAtomValue(overdriveHacksCanApplyHackAtom("override"));

  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  const isOverrideHackLoading = overdriveHacksMachineSnapshot.matches("applyingOverrideHack");
  const isOverrideHackReady = Option.isSome(theOverride);

  // Controls whether the popover is open or not
  const [isOpen, setIsOpen] = useState(false);
  const gt = useGT();
  const locale = useLocale();

  const close = useCallback(() => setIsOpen(false), []);
  const canApplyById = { emp: canApplyHackEmp, sonar: canApplyHackSonar } as const;

  return (
    <GamePopover open={isOpen} onOpenChange={setIsOpen} title={gt("Overdrive Hacks")} trigger={<LifebuoyIcon className="size-11" />}>
      {HACKS.map(({ id, label, translatable, Icon }) => (
        <Button
          key={id}
          className="button grid grid-cols-[auto_1fr_1fr]"
          disabled={!canApplyById[id]}
          onClick={() => {
            overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: id });
            close();
          }}
        >
          <Icon className="size-11" />
          <span className="justify-self-start">{translatable ? <T>Sonar</T> : label}</span>
          <HackCostBadge>
            <Var>-{OVERDRIVE_HACK_COST(id).toLocaleString(locale)}</Var> <T>pts</T>
          </HackCostBadge>
        </Button>
      ))}
      {isOverrideHackReady ? (
        <Button
          className="button grid grid-cols-[auto_1fr_1fr]"
          onClick={() => {
            modalMachineEvent({ type: "opened", modalType: "override-hack" });
            close();
          }}
        >
          <SparklesIcon className="size-11" />
          <span className="justify-self-start">
            <T>AI Override</T>
          </span>
          <span className="rounded-md bg-tile-green px-3 py-2 font-sans text-text-2">
            <T>Ready ↗</T>
          </span>
        </Button>
      ) : (
        <Button
          className="button grid grid-cols-[auto_1fr_1fr]"
          disabled={!canApplyHackOverride || isOverrideHackLoading}
          onClick={() => {
            overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "override" });
          }}
        >
          {isOverrideHackLoading ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
          <span className="justify-self-start">
            <T>AI Override</T>
          </span>
          <HackCostBadge>
            <Var>-{OVERDRIVE_HACK_COST("override").toLocaleString(locale)}</Var> <T>pts</T>
          </HackCostBadge>
        </Button>
      )}
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
