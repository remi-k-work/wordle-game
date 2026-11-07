// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

interface PulsingStatusTextProps {
  // The two "in flight" states of the content: either one pulses the text
  isAwaiting: boolean;
  isLoading: boolean;
  // Shown while the content has not been requested yet
  awaiting: ReactNode;
  // Shown while the content is being generated
  loading: ReactNode;
  // The content itself once it has arrived — or its fallback
  children: ReactNode;
}

// constants
const TEXT_CLASSES = cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl");

// The paragraph every asynchronously-generated text surface in the app shows
export function PulsingStatusText({ isAwaiting, isLoading, awaiting, loading, children }: PulsingStatusTextProps) {
  const isPulsing = isAwaiting || isLoading;
  const message = isAwaiting ? awaiting : isLoading ? loading : children;

  return <p className={cn(TEXT_CLASSES, isPulsing && "animate-pulse")}>{message}</p>;
}
