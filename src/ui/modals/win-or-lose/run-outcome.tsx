// components
import { SecretWordReveal } from "./secret-word";

// types
import type { ReactNode } from "react";

// Shared shell for the win and loss outcomes
export function RunOutcome({ secretWord, message, children }: { secretWord: string; message: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-prose space-y-4">
      {message}
      <SecretWordReveal secretWord={secretWord} />
      {children}
    </article>
  );
}
