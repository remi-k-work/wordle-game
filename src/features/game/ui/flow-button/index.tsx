// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { alertMachineAtom } from "@/state/alert";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { gameFlowVariantAtom } from "@/features/game/state/game-flow-variant";
import { T, useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { ForwardIcon, PowerIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface GameFlowButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  keepText?: boolean;
  onClicked?: () => void;
}

interface GameFlowAction {
  title: string;
  icon: ReactNode;
  label: ReactNode;
  className?: string;
  onClick: () => void;
}

export function GameFlowButton({ className, keepText = false, onClicked, ...rest }: GameFlowButtonProps) {
  const variant = useAtomValue(gameFlowVariantAtom);
  const gameFlowMachineEvent = useAtomSet(gameFlowMachineAtom);
  const alertMachineEvent = useAtomSet(alertMachineAtom);
  const gt = useGT();

  if (variant === "skeleton") return <GameFlowButtonSkeleton className={className} keepText={keepText} {...rest} />;

  const action = Match.value(variant).pipe(
    Match.when("next", (): GameFlowAction => ({
      title: gt("Next Word"),
      icon: <ForwardIcon className="size-11" />,
      label: <T>Next Word</T>,
      onClick: () => gameFlowMachineEvent({ type: "word.nextRequested" }),
    })),
    Match.when("start", (): GameFlowAction => ({
      title: gt("Start New Run"),
      icon: <PuzzlePieceIcon className="size-11" />,
      label: <T>Start New Run</T>,
      onClick: () => gameFlowMachineEvent({ type: "run.startRequested" }),
    })),
    Match.when("forfeit", (): GameFlowAction => ({
      title: gt("Forfeit Run"),
      icon: <PowerIcon className="size-11" />,
      label: <T>Forfeit Run</T>,
      className: "bg-destructive",
      onClick: () => alertMachineEvent({ type: "opened", alertType: "forfeit-run" }),
    })),
    Match.exhaustive
  );

  return (
    <Button
      className={cn("button", !keepText && "max-sm:p-1", action.className, className)}
      title={action.title}
      {...rest}
      onClick={() => {
        action.onClick();
        onClicked?.();
      }}
    >
      {action.icon}
      {keepText ? action.label : <span className="hidden sm:block">{action.label}</span>}
    </Button>
  );
}

export function GameFlowButtonSkeleton({ className, keepText = false, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1", className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}
