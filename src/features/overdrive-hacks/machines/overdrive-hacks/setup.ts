// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";
import { OverdriveHacks } from "./models";
import { applyEmpHackActor, applyOverrideHackActor, applySonarHackActor, fetchOverrideAudioActor } from "./actors";
import { modalMachineSendAtom } from "@/state/modal";

export const setup = setupEffect({
  schemas: {
    context: OverdriveHacks,
    events: {
      solutionsLanguageChanged: Schema.Struct({}),
      "puzzle.started": Schema.Struct({}),
      "puzzle.ended": Schema.Struct({}),
      "input.keyPressed": Schema.Struct({ pressedKey: Schema.String }),
      "hack.useRequested": Schema.Struct({ overdriveHackId: OverdriveHackId }),
    },
    actions: {
      forwardKeyPress: { params: Schema.Struct({ pressedKey: Schema.String }) },
      onOverrideHackApplied: { params: Schema.Struct({}) },
      logHackFailure: { params: Schema.Struct({ hackId: Schema.String, error: Schema.Unknown }) },
    },
  },
  guards: {
    isEmpHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "emp";
    },
    isSonarHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "sonar";
    },
    isOverrideHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "override";
    },
  },
  actors: { applyEmpHackActor, applySonarHackActor, applyOverrideHackActor, fetchOverrideAudioActor },
  actions: {
    forwardKeyPress: ({ pressedKey }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(wordChallengeMachineSendAtom, { type: "keyPressed", pressedKey }),

    // A failed override still opens the modal, which has its own "unavailable" state
    onOverrideHackApplied: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(modalMachineSendAtom, { type: "opened", modalType: "override-hack" }),

    logHackFailure: ({ hackId, error }) => Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, error),
  },
});
