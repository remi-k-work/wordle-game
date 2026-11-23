// services, features, and other libraries
import { Array } from "effect";

// types
import type { Letter } from "@/features/game/domain/models";
import type { Keyboard } from "./models";

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_KEYBOARD = () => ({ blockedLetters: Array.empty<Letter>() }) as const satisfies Keyboard;
