// services, features, and other libraries
import { createBrowserInspector } from "@statelyai/inspect";

// constants
const SHOULD_INSPECT = process.env.NODE_ENV === "development";
export const { inspect } = SHOULD_INSPECT ? createBrowserInspector() : {};
