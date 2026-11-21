// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  onSolutionsLanguageToggled: { params: Schema.Struct({ solutionsLanguage: SolutionsLanguage }) },
};

export const actions = {
  // Notify all the other machines about the solutions language change
  onSolutionsLanguageToggled: ({ solutionsLanguage }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
    Atom.set(gameFlowMachineSendAtom, { type: "language.changed", solutionsLanguage }),
} satisfies ActionImplementations<typeof Actions>;
