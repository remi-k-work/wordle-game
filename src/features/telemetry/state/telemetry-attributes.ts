// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { sessionIdAtom } from "@/features/player/state/player";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// types
import type { TelemetryAttributes } from "@/features/telemetry/services/telemetry-tracker";

// The only place telemetry reads application state; callers invoke it inside the
// same effect as the tracked action, so the attributes are current at the moment
// of tracking (never captured earlier)
export const telemetryAttributes = Effect.fnUntraced(function* () {
  const sessionId = yield* Atom.get(sessionIdAtom);
  const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
  return { sessionId, solutionsLanguage } satisfies TelemetryAttributes;
});
