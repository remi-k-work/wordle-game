// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomSet } from "@effect/atom-react";
import { alertMachineAtom } from "@/state";
import { gameFlowMachineAtom } from "@/features/game/state";
import { useGameFlowVariant } from "@/features/game/hooks";

// components
import { Button } from "@base-ui/react";
import { T, useGT } from "gt-next";
import { FlowShell } from "./flow-shell";

// assets
import { ForwardIcon, PowerIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

interface GameFlowButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  keepText?: boolean;
  onClicked?: () => void;
}

export function GameFlowButton({ className, keepText = false, onClicked, ...rest }: GameFlowButtonProps) {
  const variant = useGameFlowVariant();
  const gameFlowMachineEvent = useAtomSet(gameFlowMachineAtom);
  const alertMachineEvent = useAtomSet(alertMachineAtom);
  const gt = useGT();

  return Match.value(variant).pipe(
    Match.when("skeleton", () => <GameFlowButtonSkeleton {...rest} />),
    Match.when("next", () => (
      <FlowShell
        className={className}
        keepText={keepText}
        title={gt("Next Word")}
        icon={<ForwardIcon className="size-11" />}
        label={<T>Next Word</T>}
        onClick={() => {
          gameFlowMachineEvent({ type: "word.nextRequested" });
          onClicked?.();
        }}
        {...rest}
      />
    )),
    Match.when("start", () => (
      <FlowShell
        className={className}
        keepText={keepText}
        title={gt("Start New Run")}
        icon={<PuzzlePieceIcon className="size-11" />}
        label={<T>Start New Run</T>}
        onClick={() => {
          gameFlowMachineEvent({ type: "run.startRequested" });
          onClicked?.();
        }}
        {...rest}
      />
    )),
    Match.orElse(() => (
      <FlowShell
        className={cn("bg-destructive", className)}
        keepText={keepText}
        title={gt("Forfeit Run")}
        icon={<PowerIcon className="size-11" />}
        label={<T>Forfeit Run</T>}
        onClick={() => {
          alertMachineEvent({ type: "opened", alertType: "forfeit-run" });
          onClicked?.();
        }}
        {...rest}
      />
    ))
  );
}

export function GameFlowButtonSkeleton({ className, keepText = false, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1", className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}
