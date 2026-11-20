"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

const Ctx = createContext<Locale>("uk");

/** Мова для клієнтських компонентів. Словник береться з бандла — він невеликий. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);
export const useT = (): Dict => dictionaries[useContext(Ctx)];
