// services, features, and other libraries
import { makeWordlistSync } from "./wordlist";
import { runSeed } from "./runtime";

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(
  makeWordlistSync({
    inputs: ["./src/seed/dictionary-pl.txt"],
    output: "./src/seed/solutions-pl.json",
    doneMessage: "Solutions successfully generated!",
  })
);
