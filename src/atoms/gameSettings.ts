/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Schema } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/RuntimeClient";

// types
import type { GameSettings } from "@/domain";

// Persistent storage for game settings
export const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom as any,
  key: "@wordle/gameSettings",
  schema: Schema.Struct({ solutionsLanguage: Schema.Literal("En", "Pl") }),
  defaultValue: () => ({ solutionsLanguage: "En" }) as const satisfies GameSettings,
});

// Specialized selectors for granular state access and optimized re-renders
export const solutionsLanguageAtom = gameSettingsAtom.pipe(Atom.map((state) => state.solutionsLanguage));
