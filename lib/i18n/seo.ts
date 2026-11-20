import { locales, localizeHref, localeMeta } from "./config";
import { getLocale } from "./server";

/**
 * canonical + hreflang для сторінки: path без мовного префікса ("/novyny/slug").
 * Відносні адреси — Next доповнює їх metadataBase.
 */
export function alternates(path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [localeMeta[l].hreflang, localizeHref(path, l)]),
  );
  languages["x-default"] = localizeHref(path, "uk");
  return { canonical: localizeHref(path, getLocale()), languages };
}
