// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { alertMachineAtom } from "@/state";

// components
import { AlertDialog } from "@base-ui/react";

// assets
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

interface AlertProps {
  isOpen?: boolean;
  title: string;
  onOkayed: () => void | Promise<void>;
  children: ReactNode;
}

export function Alert({ isOpen = false, title, onOkayed, children }: AlertProps) {
  const alertMachineEvent = useAtomSet(alertMachineAtom);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && alertMachineEvent({ type: "cancelled" })}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            "fixed inset-0 bg-black opacity-75",
            "transition-opacity duration-300 ease-in-out",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "supports-[-webkit-touch-callout:none]:absolute"
          )}
        />
        <AlertDialog.Viewport className="fixed inset-0 flex items-center justify-center overflow-hidden">
          <AlertDialog.Popup
            className={cn(
              "relative max-h-[80dvh] w-[90dvw] max-w-3xl overflow-auto bg-surface-1 p-3 text-center text-text-1",
              "transition duration-300 ease-in-out",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            <h1 className="mb-5 max-w-none bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-2 font-sans text-4xl tracking-widest text-text-2 uppercase">
              {title}
            </h1>
            {children}
            <section className="mx-auto mt-6 flex max-w-prose flex-wrap items-center justify-around gap-4">
              <AlertDialog.Close className="button" onClick={() => alertMachineEvent({ type: "okayed", onOkayed })}>
                <CheckCircleIcon className="size-11" />
                OK
              </AlertDialog.Close>
              <AlertDialog.Close className="button bg-secondary" onClick={() => alertMachineEvent({ type: "cancelled" })}>
                <XCircleIcon className="size-11" />
                Cancel
              </AlertDialog.Close>
            </section>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
