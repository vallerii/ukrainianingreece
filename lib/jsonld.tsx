import type { Article, CmsEvent } from "./cms";
import { localeMeta, localizeHref, type Locale } from "./i18n/config";
import { dictionaries } from "./i18n/dictionaries";
import { absoluteUrl } from "./seo";
import { site } from "./site";

/**
 * Структуровані дані schema.org (JSON-LD) — щоб Google розумів, що це організація,
 * події й статті, і міг показувати розширені результати (дата й місце події тощо).
 * Перевірка: https://search.google.com/test/rich-results
 */

const ORG_ID = absoluteUrl("/#organization");

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // "<" екрануємо, щоб текст із CMS не міг закрити тег <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Організація + сайт — на кожній сторінці (з layout). */
export function siteGraph(locale: Locale) {
  const t = dictionaries[locale].site;
  const home = absoluteUrl(localizeHref("/", locale));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        "@id": ORG_ID,
        name: t.name,
        alternateName: [dictionaries.uk.site.name, dictionaries.en.site.name, dictionaries.el.site.name].filter((n) => n !== t.name),
        url: absoluteUrl("/"),
        logo: absoluteUrl("/icon.png"),
        description: t.description,
        foundingDate: String(site.founded),
        email: site.email,
        telephone: site.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: locale === "el" ? "Φερών 4" : "Feron 4",
          postalCode: "104 34",
          addressLocality: locale === "el" ? "Αθήνα" : "Athens",
          addressCountry: "GR",
        },
        areaServed: { "@type": "Country", name: "Greece" },
        sameAs: site.socials.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: t.name,
        inLanguage: localeMeta[locale].hreflang,
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl(localizeHref("/poshuk", locale))}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function eventLd(e: CmsEvent, locale: Locale) {
  const url = absoluteUrl(localizeHref(`/podiyi/${e.slug}`, locale));
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.description || undefined,
    url,
    startDate: e.start,
    endDate: e.finish ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: localeMeta[locale].hreflang,
    image: e.image ? [e.image.url] : undefined,
    location: {
      "@type": "Place",
      name: e.title,
      address: { "@type": "PostalAddress", addressCountry: "GR" },
      ...(e.location ? { geo: { "@type": "GeoCoordinates", latitude: e.location.latitude, longitude: e.location.longitude } } : {}),
    },
    organizer: { "@id": ORG_ID, "@type": "Organization", name: dictionaries[locale].site.name, url: absoluteUrl("/") },
  };
}

export function articleLd(a: Article, locale: Locale, description: string, kind: "NewsArticle" | "BlogPosting") {
  const url = absoluteUrl(localizeHref(a.href, locale));
  return {
    "@context": "https://schema.org",
    "@type": kind,
    headline: a.title.slice(0, 110),
    description,
    url,
    mainEntityOfPage: url,
    datePublished: a.date,
    inLanguage: localeMeta[locale].hreflang,
    image: a.image ? [a.image.url] : [absoluteUrl(localizeHref("/opengraph-image", locale))],
    author: a.author
      ? { "@type": "Person", name: a.author.name }
      : { "@id": ORG_ID, "@type": "Organization", name: dictionaries[locale].site.name },
    publisher: { "@id": ORG_ID, "@type": "Organization", name: dictionaries[locale].site.name, logo: absoluteUrl("/icon.png") },
  };
}
