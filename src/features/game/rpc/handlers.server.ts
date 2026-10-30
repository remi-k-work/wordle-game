// services, features, and other libraries
import { Effect, HashSet, Layer, Option, Schema } from "effect";
import { RpcGame } from "./requests";
import { Keypad, TheSecretWord } from "@/features/game/domain/models";
import { matchLanguage } from "@/features/game/domain/helpers";
import { generateRiddle } from "@/features/game/domain/riddle2";
import { formatTextForTTS } from "@/domain/formatters";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { makeRpcHandler, withAiFallback } from "@/domain/helpers.server";
import { fetchSpeechAudio, OpenRouter } from "@/services/open-router.server";

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

// Definitions are already local build-time assets, so riddle generation can
// use the raw dictionary meaning without waiting for the client's parallel
// fetchDefinition request to finish
const getWordDefinition = (theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage) =>
  Option.fromNullishOr(matchLanguage(solutionsLanguage, DEFINITIONS_EN[theSecretWord], DEFINITIONS_PL[theSecretWord]));

const RpcGameLayer = RpcGame.toLayer({
  fetchSolutions: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, SOLUTIONS_EN, SOLUTIONS_PL)),

  // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
  fetchDictionary: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, DICTIONARY_EN, DICTIONARY_PL)),
  fetchKeypad: ({ solutionsLanguage }) => Effect.succeedSome(matchLanguage(solutionsLanguage, KEYPAD_EN, KEYPAD_PL)),

  fetchRiddle: ({ theSecretWord, solutionsLanguage }) =>
    withAiFallback(
      generateRiddle(theSecretWord, solutionsLanguage, getWordDefinition(theSecretWord, solutionsLanguage)),
      Effect.succeedSome("No riddle available in the AI off mode.")
    ),

  fetchDefinition: ({ solutionsLanguage, theSecretWord }) =>
    Effect.succeed(getWordDefinition(theSecretWord, solutionsLanguage).pipe(Option.map(formatTextForTTS))),

  fetchRiddleAudio: fetchSpeechAudio,
  fetchWordDefinitionAudio: fetchSpeechAudio,
});

const RpcGameLayerWithAi = RpcGameLayer.pipe(Layer.provide(AiClientsWithHttp), Layer.provide(OpenRouter.layer));

export const handler = makeRpcHandler(RpcGame, "/api/rpc/game", RpcGameLayerWithAi);
