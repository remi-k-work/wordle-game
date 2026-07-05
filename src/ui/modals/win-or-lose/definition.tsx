// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaWordDefinitionAtom } from "@/features/game/state";

export function Definition() {
  const wordDefinition = useAtomValue(wordMetaWordDefinitionAtom);

  return Option.match(wordDefinition.pipe(Option.fromNullishOr), {
    onNone: () => <p>📖 The secret word definition is unavailable. 📖</p>,
    onSome: (wordDefinition) => <p>📖 {wordDefinition} 📖</p>,
  });
}
