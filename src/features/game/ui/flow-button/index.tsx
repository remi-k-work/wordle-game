// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomSet } from "@effect/atom-react";
import { alertMachineAtom } from "@/state/alert";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { useGameFlowVariant } from "@/features/game/hooks/use-game-flow-variant";
import { T, useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";
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
    Match.when("skeleton", () => <GameFlowButtonSkeleton className={className} keepText={keepText} {...rest} />),
    Match.when("next", () => (
      <FlowShell
        className={className}
        keepText={keepText}
        {...rest}
        title={gt("Next Word")}
        icon={<ForwardIcon className="size-11" />}
        label={<T>Next Word</T>}
        onClick={() => {
          gameFlowMachineEvent({ type: "word.nextRequested" });
          onClicked?.();
        }}
      />
    )),
    Match.when("start", () => (
      <FlowShell
        className={className}
        keepText={keepText}
        {...rest}
        title={gt("Start New Run")}
        icon={<PuzzlePieceIcon className="size-11" />}
        label={<T>Start New Run</T>}
        onClick={() => {
          gameFlowMachineEvent({ type: "run.startRequested" });
          onClicked?.();
        }}
      />
    )),
    Match.orElse(() => (
      <FlowShell
        className={cn("bg-destructive", className)}
        keepText={keepText}
        {...rest}
        title={gt("Forfeit Run")}
        icon={<PowerIcon className="size-11" />}
        label={<T>Forfeit Run</T>}
        onClick={() => {
          alertMachineEvent({ type: "opened", alertType: "forfeit-run" });
          onClicked?.();
        }}
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
