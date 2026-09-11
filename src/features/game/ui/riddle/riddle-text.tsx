// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";

// components
import { T } from "gt-next";

// types
interface RiddleTextProps {
  isAwaiting: boolean;
  isLoading: boolean;
  theRiddle: Option.Option<string>;
}

export function RiddleText({ isAwaiting, isLoading, theRiddle }: RiddleTextProps) {
  const isPulsing = isAwaiting || isLoading;

  return (
    <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", isPulsing && "animate-pulse")}>
      {isAwaiting ? (
        <T>Waiting for the secret word...</T>
      ) : isLoading ? (
        <T>Thinking...</T>
      ) : (
        Option.getOrElse(theRiddle, () => <T>Riddle unavailable. You are on your own!</T>)
      )}
    </p>
  );
}

export function RiddleTextSkeleton() {
  return (
    <p className="mx-auto animate-pulse text-center text-lg leading-relaxed sm:text-xl lg:text-2xl">
      <T>Thinking...</T>
    </p>
  );
}
