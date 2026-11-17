// services, features, and other libraries
import { Schema } from "effect";

// The machine only ever carries one flag: whether a persisted run session was active when the flow started
export const GameFlow = Schema.Struct({ hasActiveRun: Schema.Boolean });
