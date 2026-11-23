// services, features, and other libraries
import { Array } from "effect";

// types
import type { Keyboard } from "./models";

// Letters ruled out by the EMP hack never reach the word-challenge machine; the
// pressed key is upper-cased because a physical key press is not normalized
export const shouldForwardKeyPress = (blockedLetters: Keyboard["blockedLetters"], pressedKey: string) =>
  !Array.contains(blockedLetters, pressedKey.toUpperCase());
