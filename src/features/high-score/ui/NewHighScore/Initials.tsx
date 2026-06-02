// react
import { useMemo, useState } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { lastRunScoreAtom, lastStreakAtom } from "@/features/game/state";
import { solutionsLanguageAtom } from "@/features/settings/state";

// components
import { Button, Input } from "@base-ui/react";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Result } from "@effect-atom/atom-react";
import type { RpcClientError } from "@effect/rpc/RpcClientError";
import type { AddHighScore } from "@/features/high-score/domain";

interface InitialsProps {
  addHighScoreResult: Result.Result<void, RpcClientError>;
  addHighScore: (input: AddHighScore) => void;
}

export function Initials({ addHighScoreResult, addHighScore }: InitialsProps) {
  const lastRunScore = useAtomValue(lastRunScoreAtom);
  const lastStreak = useAtomValue(lastStreakAtom);
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);

  const [initials, setInitials] = useState("");

  const sanitizedInitials = useMemo(
    () =>
      initials
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 3),
    [initials]
  );

  const canSubmit = sanitizedInitials.length === 3 && !addHighScoreResult.waiting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addHighScore({ playerName: sanitizedInitials, score: lastRunScore, streak: lastStreak, solutionsLang: solutionsLanguage });
  };

  return (
    <form className="flex gap-4">
      <Input
        className="input text-center text-2xl"
        size={5}
        maxLength={3}
        placeholder="AAA"
        value={sanitizedInitials}
        onChange={(e) => setInitials(e.target.value)}
        disabled={addHighScoreResult.waiting}
      />

      <Button type="submit" className="button" disabled={!canSubmit} onClick={handleSubmit}>
        {addHighScoreResult.waiting ? <SpinnerIcon className="size-11" /> : <PaperAirplaneIcon className="size-11" />}
        {addHighScoreResult.waiting ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
}
