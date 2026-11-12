// services, features, and other libraries
import { Schema } from "effect";

// types
export type PlayerSession = typeof PlayerSession.Type;

// Persistent storage for uniquely identifying the player in the local browser
export const PlayerSession = Schema.Struct({
  // Version 4 exactly: the only producer is crypto.randomUUID(), which emits v4
  sessionId: Schema.Trim.check(Schema.isUUID(4)),
});
