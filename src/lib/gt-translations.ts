// services, features, and other libraries
import gtConfig from "../../gt.config.json";

// Vite statically analyzes this glob at build time and emits one lazy chunk per
// generated dictionary. Keeping the map derived from the files means adding a
// locale only requires updating gt.config.json and re-running `npm run gt:generate`
const TRANSLATION_LOADERS = import.meta.glob<{ default: unknown }>("../_gt/*.json");

const translationPath = (locale: string) => `../_gt/${locale}.json`;

export async function loadTranslations(locale: string): Promise<unknown> {
  const load = TRANSLATION_LOADERS[translationPath(locale)] ?? TRANSLATION_LOADERS[translationPath(gtConfig.defaultLocale)];

  if (!load) throw new Error(`Missing generated translation dictionary for "${locale}" (default: "${gtConfig.defaultLocale}")`);

  return (await load()).default;
}
