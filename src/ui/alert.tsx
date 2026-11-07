// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { alertMachineAtom } from "@/state/alert";
import { T } from "gt-react";

// components
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";

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

// constants
import { DIALOG_BACKDROP_CLASSES, DIALOG_FOOTER_CLASSES, DIALOG_POPUP_CLASSES, DIALOG_TITLE_CLASSES, DIALOG_VIEWPORT_CLASSES } from "@/ui/dialog-chrome";

export function Alert({ isOpen = false, title, onOkayed, children }: AlertProps) {
  const alertMachineEvent = useAtomSet(alertMachineAtom);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && alertMachineEvent({ type: "cancelled" })}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={DIALOG_BACKDROP_CLASSES} />
        <AlertDialog.Viewport className={DIALOG_VIEWPORT_CLASSES}>
          <AlertDialog.Popup className={DIALOG_POPUP_CLASSES}>
            <h1 className={DIALOG_TITLE_CLASSES}>{title}</h1>
            {children}
            <section className={DIALOG_FOOTER_CLASSES}>
              {/* Plain buttons, not `AlertDialog.Close`: the alert is controlled by
                  the machine, and `Close` would additionally drive the Root's
                  `onOpenChange` — which maps to `cancelled` — so OK would dispatch
                  both `okayed` and `cancelled`, and Cancel would dispatch
                  `cancelled` twice. Each button now has exactly one effect. */}
              <Button className="button" onClick={() => alertMachineEvent({ type: "okayed", onOkayed })}>
                <CheckCircleIcon className="size-11" />
                <T>OK</T>
              </Button>
              <Button className="button bg-secondary" onClick={() => alertMachineEvent({ type: "cancelled" })}>
                <XCircleIcon className="size-11" />
                <T>Cancel</T>
              </Button>
            </section>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
