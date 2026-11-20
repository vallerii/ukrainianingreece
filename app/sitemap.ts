import type { MetadataRoute } from "next";
import { getArticleSlugs, getEventSlugs, getFinancialReports, FINANCIAL_REPORTS_HREF } from "@/lib/cms";
import { getOrganizations } from "@/lib/organizations";
import { getTopics } from "@/lib/korysno";
import { locales, localizeHref } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Не даємо збою CMS зламати sitemap — повертаємо те, що вдалося зібрати. */
const safe = async <T,>(p: Promise<T>, fallback: T) => {
  try {
    return await p;
  } catch {
    return fallback;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events, orgs, reports] = await Promise.all([
    safe(getArticleSlugs(), []),
    safe(getEventSlugs(), []),
    safe(getOrganizations(), []),
    safe(getFinancialReports(), []),
  ]);

  // кожна сторінка — один запис з посиланнями на всі мовні версії (hreflang)
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({
    url: absoluteUrl(path),
    priority,
    changeFrequency,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizeHref(path, l))])) },
  });

  const base = [
    page("/", 1, "daily"),
    page("/novyny", 0.9, "daily"),
    page("/podiyi", 0.9, "daily"),
    page("/blog", 0.8, "weekly"),
    page("/podiyi/zvity", 0.6, "weekly"),
    page("/pro-nas", 0.8, "monthly"),
    page("/proyekty", 0.8, "monthly"),
    page("/korysno", 0.8, "monthly"),
    page("/kontakty", 0.7, "monthly"),
    page("/pidtrymaty", 0.6, "monthly"),
    page("/polityka", 0.2, "yearly"),
    ...(reports.length ? [page(FINANCIAL_REPORTS_HREF, 0.5, "monthly")] : []),
    ...orgs.map((o) => page(`/proyekty/${o.slug}`, 0.7, "monthly")),
    ...getTopics().map((t) => page(`/korysno/${t.slug}`, 0.6, "monthly")),
    ...articles.map((a) => page(a.href, 0.6, "monthly")),
    ...events.map((e) => page(`/podiyi/${e.slug}`, 0.6, "monthly")),
  ];
  // англійська й грецька версії — окремими адресами з тими самими hreflang
  return base.flatMap((p) => [
    p,
    ...locales
      .filter((l) => l !== "uk")
      .map((l) => ({ ...p, url: p.alternates.languages[l], priority: Math.round(p.priority * 8) / 10 })),
  ]);
}
