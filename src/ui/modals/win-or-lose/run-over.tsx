// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeTheSecretWordAtom } from "@/features/game/state/word-challenge";
import { T } from "gt-react";

// components
import { RunOutcome } from "./run-outcome";
import { RunScore } from "./run-score";
import { NewHighScore } from "@/features/high-score/ui/new-high-score";

// The loss branch of the win-or-lose modal, named for the outcome it reports
// (the modal's own title is "Run Over") rather than for the dismiss action the
// old name suggested — its sibling is `YouWin`, so the pair reads as the two
// outcomes of a run
export function RunOver() {
  const theSecretWord = useAtomValue(wordChallengeTheSecretWordAtom);

  // Early return: with no secret word there is nothing to reveal, and returning
  // before the JSX keeps it unindented (same shape as `YouWin` above)
  if (Option.isNone(theSecretWord)) return null;

  return (
    <RunOutcome
      secretWord={theSecretWord.value}
      message={
        <p>
          <T>Better luck next time 😄</T>
        </p>
      }
    >
      <RunScore />
      <NewHighScore />
    </RunOutcome>
  );
}
