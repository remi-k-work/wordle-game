// react
import { useState } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { highScoreIsSubmittingAtom, highScoreMachineAtom } from "@/features/high-score/state/high-score";

// components
import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { T } from "gt-react";

// assets
import { SpinnerIcon } from "@/assets/icons/spinner";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { SubmitEvent } from "react";

export function Initials() {
  const highScoreMachineEvent = useAtomSet(highScoreMachineAtom);
  const [initials, setInitials] = useState("");

  const sanitizedInitials = initials
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);

  const isSubmitting = useAtomValue(highScoreIsSubmittingAtom);
  const canSubmit = sanitizedInitials.length === 3 && !isSubmitting;

  // A single submit path: the button's `type="submit"` and the Enter key in the
  // input both reach `onSubmit`, so the dispatch and its guard live in one place
  const submitInitials = (ev: SubmitEvent) => {
    ev.preventDefault();
    if (!canSubmit) return;
    highScoreMachineEvent({ type: "initialsSubmitted", playerName: sanitizedInitials });
  };

  return (
    <form className="flex gap-4" onSubmit={submitInitials}>
      <Input
        className="input text-center text-2xl"
        size={5}
        maxLength={3}
        placeholder="AAA"
        value={sanitizedInitials}
        onChange={(ev) => setInitials(ev.target.value)}
        disabled={isSubmitting}
      />

      <Button type="submit" className="button" disabled={!canSubmit}>
        {isSubmitting ? <SpinnerIcon className="size-11" /> : <PaperAirplaneIcon className="size-11" />}
        <T>Submit</T>
      </Button>
    </form>
  );
}
