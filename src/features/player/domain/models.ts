// services, features, and other libraries
import { Schema } from "effect";

// types
export type PlayerSession = typeof PlayerSession.Type;

// Persistent storage for uniquely identifying the player in the local browser
export const PlayerSession = Schema.Struct({
  sessionId: Schema.Trim.check(Schema.isUUID()),
});
