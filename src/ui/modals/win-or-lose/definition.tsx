// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { wordDefinitionAtom } from "@/features/game/state";

export function Definition() {
  const wordDefinition = useAtomValue(wordDefinitionAtom);

  return AsyncResult.builder(wordDefinition)
    .onInitialOrWaiting(() => <p className="animate-pulse">📖 Thinking... 📖</p>)
    .onFailure(() => <p>📖 The secret word definition is unavailable. 📖</p>)
    .onSuccess((wordDefinition) => <p>📖 {wordDefinition} 📖</p>)
    .render();
}
