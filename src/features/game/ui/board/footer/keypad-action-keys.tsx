// components
import { KeypadActionKey } from "./keypad-action-key";

// The two action keys of one keypad position, as the pair they always are:
// every keypad renders Backspace and Enter together, in that order, and every
// variant renders exactly one pair per position. Stated once here instead of in
// all four places that lay it out (see `KeypadArea` and `KeypadPool`, and each of
// their skeletons), where adding a third action key or swapping the order would
// have had to be done — and kept in sync — four times over
interface KeypadActionKeysProps {
  position: "area" | "pool";
  // Skeletons render the same pair with no handler behind it; the live variants
  // pass theirs and leave `disabled` off (which `KeypadActionKey` defaults to)
  disabled?: boolean;
  onPressed?: (pressedKey: string) => void;
}

export function KeypadActionKeys({ position, disabled = false, onPressed }: KeypadActionKeysProps) {
  return (
    <>
      <KeypadActionKey action="BACKSPACE" position={position} disabled={disabled} onPressed={onPressed} />
      <KeypadActionKey action="ENTER" position={position} disabled={disabled} onPressed={onPressed} />
    </>
  );
}
