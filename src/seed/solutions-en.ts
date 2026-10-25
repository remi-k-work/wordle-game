// services, features, and other libraries
import { makeWordlistSync } from "./wordlist";
import { runSeed } from "./runtime";

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(
  makeWordlistSync({
    inputs: ["./src/seed/wordle-La.txt", "./src/seed/wordle-Ta.txt"],
    output: "./src/seed/solutions-en.json",
    doneMessage: "Solutions successfully generated!",
  })
);
