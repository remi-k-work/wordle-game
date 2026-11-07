// services, features, and other libraries
import { Option } from "effect";
import { T } from "gt-react";

// components
import { PulsingStatusText } from "@/ui/pulsing-status-text";

// types
interface RiddleTextProps {
  isAwaiting: boolean;
  isLoading: boolean;
  theRiddle: Option.Option<string>;
}

// The riddle's three states as copy: the two in-flight messages, and the
// fallback the loaded state shows when no riddle arrived. The cascade itself —
// which state shows, and the pulse while one is in flight — is
// `PulsingStatusText`'s, shared with the AI override modal, which is generated
// the same way
export function RiddleText({ isAwaiting, isLoading, theRiddle }: RiddleTextProps) {
  return (
    <PulsingStatusText isAwaiting={isAwaiting} isLoading={isLoading} awaiting={<T>Waiting for the secret word...</T>} loading={<T>Thinking...</T>}>
      {Option.getOrElse(theRiddle, () => (
        <T>Riddle unavailable. You are on your own!</T>
      ))}
    </PulsingStatusText>
  );
}
