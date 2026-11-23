// services, features, and other libraries
import { setup } from "./setup";
import { shouldForwardKeyPress } from "./helpers";

// constants
import { INITIAL_KEYBOARD } from "./constants";

// The keyboard machine is the single entry point for key input, physical and
// on-screen: it drops blocked letters and forwards the rest to the word
// challenge, so an input source never has to know about the overdrive hacks
export const keyboardMachine = setup.createMachine({
  id: "keyboard",
  context: INITIAL_KEYBOARD,
  initial: "listening",

  on: {
    blockedLettersChanged: ({ event }) => ({ context: { blockedLetters: event.blockedLetters } }),
  },

  states: {
    listening: {
      on: {
        keyPressed: (args, enq) => {
          if (shouldForwardKeyPress(args.context.blockedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },
    },
  },
});
