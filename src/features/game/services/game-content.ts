// services, features, and other libraries
import { Context, HashSet, Layer, Option, Record, Schema } from "effect";
import { Keypad, TheSecretWord } from "@/features/game/domain/models";
import { matchLanguage } from "@/features/game/domain/helpers";

// assets
import solutionsEnJson from "@/assets/data/solutions-en.json";
import solutionsPlJson from "@/assets/data/solutions-pl.json";
import keypadEnJson from "@/assets/data/keypad-en.json";
import keypadPlJson from "@/assets/data/keypad-pl.json";
import definitionsEnJson from "@/assets/data/definitions-en.json";
import definitionsPlJson from "@/assets/data/definitions-pl.json";
import dictionaryEnJson from "@/assets/data/dictionary-en.json";
import dictionaryPlJson from "@/assets/data/dictionary-pl.json";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// The service shape: the already-decoded static assets, selected by language
// Kept private: consumers reach it structurally (or via `Context.Service.Shape<typeof GameContent>`)
interface GameContentShape {
  readonly solutions: (solutionsLanguage: SolutionsLanguage) => ReadonlyArray<TheSecretWord>;
  readonly dictionary: (solutionsLanguage: SolutionsLanguage) => HashSet.HashSet<TheSecretWord>;
  readonly keypad: (solutionsLanguage: SolutionsLanguage) => Keypad;
  readonly definition: (theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage) => Option.Option<string>;
}

// Definitions are build-time assets produced by the seed scripts; validate them
// once at module scope (fail fast on a malformed asset) instead of casting. The
// schema matches the seed's own `DefinitionsSchema` (src/seed/sync.ts), and a
// missing word resolves to `undefined` at runtime (handled by `Option.fromNullishOr`)
const Definitions = Schema.Record(Schema.String, Schema.String);

// Compile each decoder once: `Schema.decodeSync` builds a parser, and every
// schema below is decoded for both language assets
const decodeDefinitions = Schema.decodeSync(Definitions);
const decodeSolutions = Schema.decodeSync(Schema.Array(TheSecretWord));
const decodeKeypad = Schema.decodeSync(Keypad);

const DEFINITIONS_EN = decodeDefinitions(definitionsEnJson);
const DEFINITIONS_PL = decodeDefinitions(definitionsPlJson);

// Validate the smaller build-time assets once at module scope (fail fast on a malformed asset)
// The 30,000+ word dictionaries are trusted as-is: re-validating every entry would add
// significant cold-start work for an asset already produced by our own build scripts
const SOLUTIONS_EN = decodeSolutions(solutionsEnJson);
const SOLUTIONS_PL = decodeSolutions(solutionsPlJson);
const KEYPAD_EN = decodeKeypad(keypadEnJson);
const KEYPAD_PL = decodeKeypad(keypadPlJson);

// Built once at module scope: hashing 30,000+ words into a HashSet is far too
// expensive to repeat on every request (server-hoist-static-io)
const DICTIONARY_EN = HashSet.fromIterable(dictionaryEnJson);
const DICTIONARY_PL = HashSet.fromIterable(dictionaryPlJson);

// The decode stays at module scope on purpose: the assets are validated once at
// import (fail fast) and hashed once, exactly as the handler did before the
// extraction; `layer` is therefore a plain `Layer.succeed` with no cold-start
// change; deferring the decode into the layer would alter startup behaviour
export class GameContent extends Context.Service<GameContent, GameContentShape>()("GameContent") {
  static readonly layer = Layer.succeed(
    GameContent,
    GameContent.of({
      solutions: (solutionsLanguage) => matchLanguage(solutionsLanguage, SOLUTIONS_EN, SOLUTIONS_PL),
      dictionary: (solutionsLanguage) => matchLanguage(solutionsLanguage, DICTIONARY_EN, DICTIONARY_PL),
      keypad: (solutionsLanguage) => matchLanguage(solutionsLanguage, KEYPAD_EN, KEYPAD_PL),

      // `Record.get` rather than an index: `Record.get` returns an `Option`, and
      // the decoded record has no index signature guaranteeing a hit (tsconfig
      // does not enable noUncheckedIndexedAccess), so a miss is `None` by construction
      definition: (theSecretWord, solutionsLanguage) => Record.get(matchLanguage(solutionsLanguage, DEFINITIONS_EN, DEFINITIONS_PL), theSecretWord),
    })
  );

  // Test-only: empty assets unless a fixture overrides a method, so server tests never load the real 30,000-word dictionaries
  static readonly layerTest = (fixtures: Partial<GameContentShape> = {}) =>
    Layer.succeed(
      GameContent,
      GameContent.of({
        solutions: () => [],
        dictionary: () => HashSet.empty(),
        keypad: () => [],
        definition: () => Option.none(),
        ...fixtures,
      })
    );
}
