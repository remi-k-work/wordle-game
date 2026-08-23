// react
import { useMemo, useState } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { highScoreMachineAtom } from "@/features/high-score/state";

// components
import { Button, Input } from "@base-ui/react";
import { T } from "gt-next";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export function Initials() {
  const [highScoreMachineSnapshot, highScoreMachineEvent] = useAtom(highScoreMachineAtom);
  const [initials, setInitials] = useState("");

  const sanitizedInitials = useMemo(
    () =>
      initials
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 3),
    [initials]
  );

  const canSubmit = sanitizedInitials.length === 3 && !highScoreMachineSnapshot.matches("submitting");
  const isSubmitting = highScoreMachineSnapshot.matches("submitting");

  return (
    <form className="flex gap-4" onSubmit={(ev) => ev.preventDefault()}>
      <Input
        className="input text-center text-2xl"
        size={5}
        maxLength={3}
        placeholder="AAA"
        value={sanitizedInitials}
        onChange={(ev) => setInitials(ev.target.value)}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        className="button"
        disabled={!canSubmit}
        onClick={() => highScoreMachineEvent({ type: "initialsSubmitted", playerName: sanitizedInitials })}
      >
        {isSubmitting ? <SpinnerIcon className="size-11" /> : <PaperAirplaneIcon className="size-11" />}
        <T>Submit</T>
      </Button>
    </form>
  );
}
