// components
import { Definition } from "./definition";

// Shared secret-word header for the win/lose branches: the revealed word plus
// its definition stay visually identical in both outcomes.
export function SecretWordReveal({ secretWord }: { secretWord: string }) {
  return (
    <>
      <h2 className="text-4xl font-semibold text-destructive uppercase">{secretWord}</h2>
      <Definition />
    </>
  );
}
