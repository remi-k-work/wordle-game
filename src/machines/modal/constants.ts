// services, features, and other libraries
import { msg } from "gt-react";

// types
import type { StateModalType } from "./models";

// The win-or-lose modal derives its title from game state, so it builds its own `Modal`; every other modal registers its static title here
export const MODAL_TITLES = {
  help: msg("Help"),
  "high-score": msg("High Score"),
  "voice-settings": msg("Voice Settings"),
  "override-hack": msg("AI Override"),
} as const satisfies Record<StateModalType, unknown>;
