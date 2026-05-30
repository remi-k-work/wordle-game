// services, features, and other libraries
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { wordDefinitionAtom } from "@/features/game/state";

export function Definition() {
  const wordDefinition = useAtomValue(wordDefinitionAtom);

  return Result.builder(wordDefinition)
    .onInitialOrWaiting(() => <p className="animate-pulse">📖 Thinking... 📖</p>)
    .onFailure(() => <p>📖 The secret word definition is unavailable. 📖</p>)
    .onSuccess((wordDefinition) => <p>📖 {wordDefinition} 📖</p>)
    .render();
}
