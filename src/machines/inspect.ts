// services, features, and other libraries
import { createBrowserInspector } from "@statelyai/inspect";

// constants
const SHOULD_INSPECT = false;
export const { inspect } = SHOULD_INSPECT ? createBrowserInspector() : {};
