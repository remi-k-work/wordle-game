// services, features, and other libraries
import { Option } from "effect";
import { generateSingleField2 } from "@/domain/generate-single-field2";
import { matchLanguage } from "./helpers";

// types
import type { SolutionsLanguage, TheSecretWord, WordMeta } from "./models";

// constants
const SYSTEM_PROMPT_EN = (theSecretWord: TheSecretWord) => `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "${theSecretWord}".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question (e.g., "What am I?").
2. Reference at least one concrete real-world domain, function, or associated object so a player can logically guess it.
3. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
4. Keep it plain text, suitable for Text-To-Speech (no Markdown, emojis, or formatting).
5. Do not include any preamble or meta-talk. Output ONLY the riddle.
6. SELF-VERIFY: Ensure the word "${theSecretWord}" is completely absent. The definition may contain it; never copy parts of the definition that reveal it.
7. If a dictionary definition is provided, use it only to identify the intended meaning. Do not quote or closely paraphrase it, and do not mention that you were given a definition.
8. The riddle must be an imaginative clue, not a dictionary definition. Use concrete imagery instead of listing properties.

EXAMPLE TONE AND FORMAT:
Context: Secret word is "MIRROR"
Riddle: I can show you the world, but I have no eyes. I reflect your every move but have no mind of my own. What am I?
`;
const SYSTEM_PROMPT_PL = (theSecretWord: TheSecretWord) => `
Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej.
Ukryte słowo dla tej zagadki to "${theSecretWord}".

ZASADY KRYTYCZNE:
1. Napisz krótką, wciągającą zagadkę (od 1 do 3 zdań), która kończy się pytaniem (np. "Czym jestem?").
2. Odnieś się do co najmniej jednej konkretnej dziedziny, funkcji lub przedmiotu z prawdziwego świata, aby gracz mógł logicznie odgadnąć słowo.
3. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Zwróć szczególną uwagę na polską odmianę (przypadki, liczba mnoga).
4. Tekst musi być zwykły i przyjazny dla Text-To-Speech (bez Markdowna, emotikonów i formatowania).
5. Nie używaj wstępów ani metakomentarzy. Wypisz TYLKO zagadkę.
6. SAMOWERYFIKACJA: Upewnij się, że słowo "${theSecretWord}" (w żadnej formie) nie pojawia się w tekście. Definicja może zawierać to słowo — nie kopiuj jej fragmentów, które je ujawniają.
7. Jeśli podano definicję słownikową, użyj jej wyłącznie do ustalenia właściwego znaczenia. Nie cytuj jej ani nie parafrazuj zbyt blisko i nie wspominaj, że ją otrzymałeś.
8. Zagadka musi być pomysłową wskazówką, a nie definicją słownikową. Używaj konkretnych obrazów zamiast wyliczać cechy.
9. Pisz naturalną, poprawną gramatycznie polszczyzną. Ustal rodzaj gramatyczny i liczbę ukrytego słowa, a następnie konsekwentnie dopasuj rodzaj i liczbę przymiotników, zaimków oraz czasowników. Unikaj kalk z angielskiego.

PRZYKŁAD TONU I FORMATU:
Kontekst: Ukryte słowo to "LUSTRO"
Zagadka: Mogę ukazać ci świat, chociaż nie mam oczu. Powielam każdy twój ruch, lecz nie mam własnego umysłu. Czym jestem?
`;

// A definition is optional because the riddle flow must still work when the
// definition asset is unavailable. When present, it disambiguates exotic words
// and homonyms without adding another RPC round-trip
const definitionContextEn = (wordDefinition: WordMeta["wordDefinition"]) =>
  Option.match(wordDefinition, {
    onSome: (value) =>
      `Official dictionary meaning for reference: "${value}"\n-> Use this only to identify the intended sense of the secret word. Do not quote or closely paraphrase it, and never repeat the secret word or its inflected forms.\n\n`,
    onNone: () => "",
  });
const definitionContextPl = (wordDefinition: WordMeta["wordDefinition"]) =>
  Option.match(wordDefinition, {
    onSome: (value) =>
      `Oficjalna definicja słownikowa do wglądu: "${value}"\n-> Użyj jej wyłącznie do ustalenia właściwego znaczenia ukrytego słowa. Nie cytuj jej ani nie parafrazuj zbyt blisko; nigdy nie powtarzaj ukrytego słowa ani jego form odmienionych.\n\n`,
    onNone: () => "",
  });

const RIDDLE_PROMPT_EN = (wordDefinition: WordMeta["wordDefinition"]) => `${definitionContextEn(wordDefinition)}Craft the riddle now.`;
const RIDDLE_PROMPT_PL = (wordDefinition: WordMeta["wordDefinition"]) => `${definitionContextPl(wordDefinition)}Stwórz zagadkę teraz.`;
const DESCRIPTION_EN = "Plain prose, a short riddle (1-3 sentences) ending in a question, TTS-friendly. No Markdown or emojis.";
const DESCRIPTION_PL = "Zwykły tekst, krótka, poprawna gramatycznie zagadka (1-3 zdania) zakończona pytaniem, przyjazna dla TTS. Bez Markdownu i emotikonów.";

// Builds the language-specific generation options for a riddle. Exported so the
// OpenRouter/Cloudflare proof scripts exercise the exact same prompts as
// production (single source of truth)
export const riddleGenerationOptions = (
  theSecretWord: string,
  solutionsLanguage: SolutionsLanguage,
  wordDefinition: WordMeta["wordDefinition"] = Option.none()
) => ({
  instructions: matchLanguage(solutionsLanguage, SYSTEM_PROMPT_EN(theSecretWord), SYSTEM_PROMPT_PL(theSecretWord)),
  prompt: matchLanguage(solutionsLanguage, RIDDLE_PROMPT_EN(wordDefinition), RIDDLE_PROMPT_PL(wordDefinition)),
  fieldName: "riddle",
  description: matchLanguage(solutionsLanguage, DESCRIPTION_EN, DESCRIPTION_PL),
});

export const generateRiddle = (
  theSecretWord: TheSecretWord,
  solutionsLanguage: SolutionsLanguage,
  wordDefinition: WordMeta["wordDefinition"] = Option.none()
) => generateSingleField2(riddleGenerationOptions(theSecretWord, solutionsLanguage, wordDefinition));
