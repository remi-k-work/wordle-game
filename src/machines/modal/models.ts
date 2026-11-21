// services, features, and other libraries
import { Schema } from "effect";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type ModalType = (typeof MODAL_TYPES)[number];
export type StateModalType = Exclude<ModalType, "status">;
export type Events = EventUnion<typeof Events>;

// Every modal the app can show; the single source of truth
const MODAL_TYPES = ["help", "status", "voice-settings", "high-score", "override-hack"] as const;

// Events are part of the machine's interface
export const Events = {
  opened: Schema.Struct({ modalType: Schema.Literals(MODAL_TYPES) }),
  closed: Schema.Struct({}),
};
