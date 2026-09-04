// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function CloseModalButton() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <Button tabIndex={-1} className="button mx-auto mt-8 bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
      <XCircleIcon className="size-11" />
      <T>Close</T>
    </Button>
  );
}
