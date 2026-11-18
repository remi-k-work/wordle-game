// services, features, and other libraries
import { Option } from "effect";

// types
import type { WordMeta } from "./models";

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_WORD_META = () =>
  ({
    theRiddle: Option.none(),
    wordDefinition: Option.none(),
    theRiddleAudio: Option.none(),
    wordDefinitionAudio: Option.none(),
  }) as const satisfies WordMeta;
