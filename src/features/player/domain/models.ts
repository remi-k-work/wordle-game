// services, features, and other libraries
import { Schema } from "effect";

// Persistent storage for uniquely identifying the player in the local browser
export class PlayerSession extends Schema.Class<PlayerSession>("PlayerSession")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
}) {}
