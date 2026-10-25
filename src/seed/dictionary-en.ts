// services, features, and other libraries
import { makeWordlistSync } from "./wordlist";
import { runSeed } from "./runtime";

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(
  makeWordlistSync({
    inputs: ["./src/seed/wordle-La.txt", "./src/seed/wordle-Ta.txt"],
    output: "./src/seed/dictionary-en.json",
    doneMessage: "English dictionary successfully generated!",
  })
);
