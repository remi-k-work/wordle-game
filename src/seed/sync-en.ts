// services, features, and other libraries
import { makeSync } from "./sync";
import { runSeed } from "./runtime";

// constants
const SOLUTIONS_PATH = "./src/seed/solutions-en.json";
const DEFINITIONS_PATH = "./src/seed/definitions-en.json";

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(makeSync(SOLUTIONS_PATH, DEFINITIONS_PATH));
