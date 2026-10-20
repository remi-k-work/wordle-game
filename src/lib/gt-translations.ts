// services, features, and other libraries
// An explicit map of allowed dictionaries: each import stays statically analyzable, so the
// bundler knows exactly which locale files exist instead of widening the glob to the folder
const TRANSLATION_LOADERS = {
  en: () => import("../_gt/en.json"),
  pl: () => import("../_gt/pl.json"),
} as const;

export async function loadTranslations(locale: string): Promise<unknown> {
  const load = locale in TRANSLATION_LOADERS ? TRANSLATION_LOADERS[locale as keyof typeof TRANSLATION_LOADERS] : TRANSLATION_LOADERS.en;
  return (await load()).default;
}

// Locales with generated dictionaries available; anything else falls back to the default
export const hasTranslations = (locale: string): boolean => locale in TRANSLATION_LOADERS;
