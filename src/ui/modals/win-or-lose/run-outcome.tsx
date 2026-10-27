// components
import { SecretWordReveal } from "./secret-word";

// Shared shell for the win and loss outcomes: a message, the revealed secret
// word, and the run score, with caller-provided content (the scoring simulator
// on a win, the new-high-score form on a loss) rendered last so each branch
// keeps its own visual order; runs core outcome UI in one place instead of
// duplicating the article wrapper + secret-word reveal across two branches.
export function RunOutcome({ secretWord, message, children }: { secretWord: string; message: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-prose space-y-4">
      {message}
      <SecretWordReveal secretWord={secretWord} />
      {children}
    </article>
  );
}
