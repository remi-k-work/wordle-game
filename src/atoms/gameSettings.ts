/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/RuntimeClient";
import { GameSettingsSchema } from "@/domain";

// Persistent storage for game settings
export const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom as any,
  key: "@wordle/gameSettings",
  schema: GameSettingsSchema,
  defaultValue: () => ({ solutionsLanguage: "En" }) as const,
});

// Specialized selectors for granular state access and optimized re-renders
export const solutionsLanguageAtom = gameSettingsAtom.pipe(Atom.map((state) => state.solutionsLanguage));
