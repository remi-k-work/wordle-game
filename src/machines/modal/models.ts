// Every modal the app can show; the single source of truth
export type ModalType = "help" | "status" | "voice-settings" | "high-score" | "override-hack";

// The win-or-lose modal derives its title from game state, so it builds its own `Modal`; every other modal registers its static title here
export type StateModalType = Exclude<ModalType, "status">;
