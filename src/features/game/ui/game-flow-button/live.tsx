// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Match } from "effect";
import { useAtomSet } from "@effect/atom-react";
import { alertMachineSendAtom } from "@/state/alert";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { T, useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";
import { ResponsiveLabel } from "@/ui/responsive-label";

// constants
import { flowButtonClasses } from "./chrome";

// assets
import { ForwardIcon, PowerIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { RunAction } from "@/features/game/state/run-action";

// Every prop of the button except `onClick`: the button's action is resolved from
// the flow variant, so a caller's handler would be silently discarded here
interface GameFlowButtonLiveProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "onClick"> {
  variant: Exclude<RunAction, "skeleton">;
  keepText?: boolean;
  onClicked?: () => void;
}

interface FlowAction {
  title: string;
  icon: ReactNode;
  label: ReactNode;
  className?: string;
  onClick: () => void;
}

// Resolves the button's action (title/icon/label/handler) from the current
// flow variant; kept as a pure function so `GameFlowButtonLive` renders the
// button without mixing in domain resolution logic
// `variant` excludes "skeleton": `GameFlowButton` renders that variant directly,
// so `resolveFlowAction` only ever receives a live variant
function resolveFlowAction(
  variant: GameFlowButtonLiveProps["variant"],
  deps: { gt: ReturnType<typeof useGT>; onNext: () => void; onStart: () => void; onForfeit: () => void }
): FlowAction {
  const { gt, onNext, onStart, onForfeit } = deps;

  return Match.value(variant).pipe(
    Match.when("next", (): FlowAction => ({
      title: gt("Next Word"),
      icon: <ForwardIcon className="size-11" />,
      label: <T>Next Word</T>,
      onClick: onNext,
    })),
    Match.when("start", (): FlowAction => ({
      title: gt("Start New Run"),
      icon: <PuzzlePieceIcon className="size-11" />,
      label: <T>Start New Run</T>,
      onClick: onStart,
    })),
    Match.when("forfeit", (): FlowAction => ({
      title: gt("Forfeit Run"),
      icon: <PowerIcon className="size-11" />,
      label: <T>Forfeit Run</T>,
      className: "bg-destructive",
      onClick: onForfeit,
    })),
    Match.exhaustive
  );
}

// `GameFlowButtonLive` renders the button for a resolved flow action; all domain logic about what each variant means lives in `resolveFlowAction`
export function GameFlowButtonLive({ variant, className, keepText = false, onClicked, ...rest }: GameFlowButtonLiveProps) {
  const gt = useGT();
  const runSessionMachineEvent = useAtomSet(runSessionMachineSendAtom);
  const alertMachineEvent = useAtomSet(alertMachineSendAtom);

  const action = resolveFlowAction(variant, {
    gt,
    onNext: () => runSessionMachineEvent({ type: "nextWordRequested" }),
    onStart: () => runSessionMachineEvent({ type: "newRunStarted" }),
    onForfeit: () => alertMachineEvent({ type: "opened", alertType: "forfeit-run" }),
  });

  return (
    <Button
      className={cn(flowButtonClasses(keepText), action.className, className)}
      title={action.title}
      {...rest}
      onClick={() => {
        action.onClick();
        onClicked?.();
      }}
    >
      {action.icon}
      <ResponsiveLabel keepText={keepText}>{action.label}</ResponsiveLabel>
    </Button>
  );
}
