// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

export function CloseModalButton({ className }: ComponentPropsWithoutRef<typeof Button>) {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <Button tabIndex={-1} className={cn("button mx-auto mt-8 bg-secondary", className)} onClick={() => modalMachineEvent({ type: "closed" })}>
      <XCircleIcon className="size-11" />
      <T>Close</T>
    </Button>
  );
}
