import { locales, localizeHref, localeMeta } from "./config";
import { getLocale } from "./server";
import { dictionaries } from "./dictionaries";

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

/**
 * Open Graph для сторінок, що задають власний openGraph (новини, статті, події).
 * Next.js не зливає openGraph сторінки з layout, тож siteName, мову й запасну
 * картинку (згенеровану /opengraph-image) додаємо тут — інакше прев'ю в соцмережах без картинки.
 */
export function pageOpenGraph(og: {
  type?: "article" | "website";
  title: string;
  description?: string;
  publishedTime?: string;
  image?: string | null;
}) {
  const locale = getLocale();
  const { image, ...rest } = og;
  return {
    ...rest,
    siteName: dictionaries[locale].site.name,
    locale: localeMeta[locale].og,
    images: image ? [{ url: image }] : [{ url: localizeHref("/opengraph-image", locale), width: 1200, height: 630 }],
  };
}
