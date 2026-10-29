// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useMessages } from "gt-react";

// components
import { Toast } from "@base-ui/react/toast";

// types
import type { ReactNode } from "react";
type ToastItemData = ReturnType<typeof Toast.useToastManager>["toasts"][number];

interface ToastItemProps {
  toast: ToastItemData;
}

// assets
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// constants
// Fully static class strings, hoisted so the per-toast render doesn't re-run them through twMerge on every toast add/update/remove
const TOAST_ROOT_CLASS = cn(
  "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
  "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 h-(--height) w-full border bg-surface-2 shadow-sm select-none",
  "transition duration-300 ease-in-out",
  "origin-bottom",
  "transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  "data-[type=error]:border-destructive data-[type=error]:text-destructive",
  "data-starting-style:transform-[translateY(150%)]",
  "data-ending-style:opacity-0",
  "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
  "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-limited:opacity-0",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]"
);

const TOAST_CONTENT_CLASS = cn(
  "flex h-full items-center gap-4 overflow-hidden p-3 transition-opacity duration-300 ease-in-out data-behind:opacity-0 data-expanded:opacity-100"
);

export function ToastItem({ toast }: ToastItemProps) {
  const messages = useMessages();

  // Toast copy is authored outside React (e.g. XState actions) with `msg()`; resolve it here, under GTProvider, so it follows the active locale
  const resolveMessage = (content: ReactNode) => (typeof content === "string" ? messages(content) : content);

  return (
    <Toast.Root toast={toast} className={TOAST_ROOT_CLASS}>
      <Toast.Content className={TOAST_CONTENT_CLASS}>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-2">
            {toast.type === "error" ? <ExclamationTriangleIcon className="size-11" /> : <CheckCircleIcon className="size-11" />}
            <Toast.Title className="font-sans text-lg font-semibold tracking-widest text-text-2 uppercase data-[type=error]:text-destructive sm:text-xl">
              {resolveMessage(toast.title)}
            </Toast.Title>
          </header>
          <Toast.Description className="text-text-1">{resolveMessage(toast.description)}</Toast.Description>
        </div>
        <Toast.Close className="button bg-secondary p-1 text-text-1">
          <XCircleIcon className="size-11" aria-hidden="true" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  );
}
