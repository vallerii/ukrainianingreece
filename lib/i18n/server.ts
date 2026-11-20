import { cache } from "react";
import { defaultLocale, isLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/**
 * Мова поточного запиту для серверних компонентів і функцій CMS.
 * Кожна сторінка, layout і generateMetadata викликають setLocale(params.locale) —
 * так сайт лишається статичним (ISR), без читання заголовків запиту.
 */
const store = cache(() => ({ locale: defaultLocale as Locale }));

export function setLocale(value: string | undefined): Locale {
  const locale = isLocale(value) ? value : defaultLocale;
  store().locale = locale;
  return locale;
}

export const getLocale = (): Locale => store().locale;

/** Словник інтерфейсу поточної мови */
export const getT = () => dictionaries[getLocale()];

/** Зручно на початку сторінки: const { locale, t } = await initPage(params) */
export async function initPage(params: Promise<{ locale: string }>) {
  const locale = setLocale((await params).locale);
  return { locale, t: dictionaries[locale] };
}
