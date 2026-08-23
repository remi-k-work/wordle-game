export default async function loadTranslations(locale: string) {
  if (locale === "en") return {};

  const translations = await import(`../public/_gt/${locale}.json`);
  return translations.default;
}
