// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state/modal";
import { T } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

// types
interface CloseModalButtonProps {
  className?: string;
}

export function CloseModalButton({ className }: CloseModalButtonProps) {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <Button className={cn("button mx-auto mt-8 bg-secondary", className)} tabIndex={-1} onClick={() => modalMachineEvent({ type: "closed" })}>
      <XCircleIcon className="size-11" />
      <T>Close</T>
    </Button>
  );
}
