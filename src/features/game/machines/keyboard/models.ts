// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type Keyboard = typeof Keyboard.Type;
export type Events = EventUnion<typeof Events>;

// The keyboard machine owns raw key input. It holds the letters the player has
// currently ruled out (EMP nuked) so it can drop those before they ever reach
// the word challenge
export const Keyboard = Schema.Struct({
  blockedLetters: Schema.Array(Letter),
});

// Events are part of the machine's interface; guards receive this union as `event`
export const Events = {
  keyPressed: Schema.Struct({ pressedKey: Schema.String }),
  blockedLettersChanged: Schema.Struct({ blockedLetters: Schema.Array(Letter) }),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  forwardKeyPress: { params: Schema.Struct({ pressedKey: Schema.String }) },
};
