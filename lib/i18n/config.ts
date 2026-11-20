/**
 * Мови сайту. Українська — основна, без префікса в адресі (/novyny),
 * англійська й грецька — з префіксом (/en/novyny, /el/novyny).
 * Слаги сторінок і матеріалів однакові для всіх мов.
 */

export const locales = ["uk", "en", "el"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uk";

export const isLocale = (v: unknown): v is Locale => locales.includes(v as Locale);

/** Для <html lang>, og:locale, Intl */
export const localeMeta: Record<Locale, { short: string; label: string; og: string; intl: string; hreflang: string }> = {
  uk: { short: "UA", label: "Українська", og: "uk_UA", intl: "uk-UA", hreflang: "uk" },
  en: { short: "EN", label: "English", og: "en_US", intl: "en-GB", hreflang: "en" },
  el: { short: "GR", label: "Ελληνικά", og: "el_GR", intl: "el-GR", hreflang: "el" },
};

/** Чи це внутрішня сторінка, яку треба вести на мовну версію (а не файл, API чи зовнішнє посилання). */
const isPageHref = (href: string) =>
  href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/api/") && !/\.[a-z0-9]{2,5}($|[?#])/i.test(href);

/** Прибирає мовний префікс: "/en/novyny" → "/novyny" */
export function stripLocale(path: string): string {
  const m = path.match(/^\/(en|el|uk)(?=\/|$|\?|#)/);
  if (!m) return path || "/";
  const rest = path.slice(m[0].length);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/** Мова за адресою в браузері */
export function localeFromPath(path: string): Locale {
  const m = path.match(/^\/(en|el)(?=\/|$)/);
  return (m?.[1] as Locale) ?? defaultLocale;
}

/** "/novyny" → "/en/novyny" для англійської; українська — без префікса */
export function localizeHref(href: string, locale: Locale): string {
  if (!isPageHref(href)) return href;
  const bare = stripLocale(href);
  if (locale === defaultLocale) return bare;
  return bare === "/" ? `/${locale}` : bare.startsWith("/?") || bare.startsWith("/#") ? `/${locale}${bare.slice(1)}` : `/${locale}${bare}`;
}
