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

// constants
const INITIALS_LENGTH = 3;

// The one rule that turns typed input into the arcade initials the form stores
// and submits: uppercase A–Z only, capped at `INITIALS_LENGTH` characters.
// Applied on write rather than on read, so React state holds exactly what the
// input shows and what the submit dispatches
const sanitizeInitials = (typed: string) =>
  typed
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, INITIALS_LENGTH);

export function Initials() {
  const highScoreMachineEvent = useAtomSet(highScoreMachineAtom);
  const [initials, setInitials] = useState("");

  const isSubmitting = useAtomValue(highScoreIsSubmittingAtom);
  const canSubmit = initials.length === INITIALS_LENGTH && !isSubmitting;

  // A single submit path: the button's `type="submit"` and the Enter key in the
  // input both reach `onSubmit`, so the dispatch and its guard live in one place
  const submitInitials = (ev: SubmitEvent) => {
    ev.preventDefault();
    if (!canSubmit) return;
    highScoreMachineEvent({ type: "initialsSubmitted", playerName: initials });
  };

  return (
    <form className="flex gap-4" onSubmit={submitInitials}>
      <Input
        className="input text-center text-2xl"
        size={5}
        maxLength={INITIALS_LENGTH}
        placeholder="AAA"
        value={initials}
        onChange={(ev) => setInitials(sanitizeInitials(ev.target.value))}
        disabled={isSubmitting}
      />

      <Button type="submit" className="button" disabled={!canSubmit}>
        {isSubmitting ? <SpinnerIcon className="size-11" /> : <PaperAirplaneIcon className="size-11" />}
        <T>Submit</T>
      </Button>
    </form>
  );
}
