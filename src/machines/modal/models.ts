// services, features, and other libraries
import { Schema } from "effect";

// types
import type { EventUnion } from "@/lib/machine-setup";

// Every modal the app can show; the single source of truth
const MODAL_TYPES = ["help", "status", "voice-settings", "high-score", "override-hack"] as const;

export type ModalType = (typeof MODAL_TYPES)[number];

// The win-or-lose modal derives its title from game state, so it builds its own `Modal`; every other modal registers its static title here
export type StateModalType = Exclude<ModalType, "status">;

// Events are part of the machine's interface
export const Events = {
  opened: Schema.Struct({ modalType: Schema.Literals(MODAL_TYPES) }),
  closed: Schema.Struct({}),
};

export type Events = EventUnion<typeof Events>;
