// services, features, and other libraries
import { cn } from "@/lib/utils";

// Shared Base-UI dialog chrome so Modal and Alert stay visually identical without copy-pasting Backdrop/Viewport/Popup classNames
export const DIALOG_BACKDROP_CLASSES = cn(
  "fixed inset-0 bg-black opacity-75",
  "transition-opacity duration-300 ease-in-out",
  "data-ending-style:opacity-0 data-starting-style:opacity-0",
  "supports-[-webkit-touch-callout:none]:absolute"
);

export const DIALOG_VIEWPORT_CLASSES = cn("fixed inset-0 flex items-center justify-center overflow-hidden");

export const DIALOG_POPUP_CLASSES = cn(
  "relative max-h-[80dvh] w-[90dvw] max-w-3xl overflow-auto bg-surface-1 p-3 text-center text-text-1",
  "transition duration-300 ease-in-out",
  "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
);

export const DIALOG_TITLE_CLASSES = cn(
  "mb-5 max-w-none bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-2 font-sans text-4xl tracking-widest text-text-2 uppercase"
);

export const DIALOG_FOOTER_CLASSES = cn("mx-auto mt-6 flex max-w-prose flex-wrap items-center justify-around gap-4");
