// services, features, and other libraries
import { Schema } from "effect";
import gtConfig from "../../gt.config.json";

// Vite statically analyzes this glob at build time and emits one lazy chunk per
// generated dictionary. Keeping the map derived from the files means adding a
// locale only requires updating gt.config.json and re-running `npm run gt:generate`
const TRANSLATION_LOADERS = import.meta.glob<{ default: unknown }>("../_gt/*.json");

// A missing dictionary is a build/config fault rather than a request fault, so
// it is reported as a tagged error like every other failure in the app instead
// of a bare `Error`: `gt-react` only needs the rejection, and anything that does
// inspect it can pattern-match on the tag
class MissingTranslationError extends Schema.TaggedError<MissingTranslationError, { readonly brand: unique symbol }>()("MissingTranslationError", {
  locale: Schema.String,
  defaultLocale: Schema.String,
}) {}

const translationPath = (locale: string) => `../_gt/${locale}.json`;

export async function loadTranslations(locale: string): Promise<unknown> {
  // `Object.hasOwn` rather than a truthy index: `locale` ultimately comes from
  // the URL, and a prototype key ("constructor", "toString", …) would otherwise
  // resolve to a non-loader value and fail on `await load()` instead
  const loaderFor = (target: string) =>
    Object.hasOwn(TRANSLATION_LOADERS, translationPath(target)) ? TRANSLATION_LOADERS[translationPath(target)] : undefined;

  const load = loaderFor(locale) ?? loaderFor(gtConfig.defaultLocale);

  // `throw` (not `Promise.reject`) keeps this an ordinary async function for the
  // Vite/gt boundary, while still surfacing a typed error
  if (load === undefined) throw new MissingTranslationError({ locale, defaultLocale: gtConfig.defaultLocale });

  return (await load()).default;
}
