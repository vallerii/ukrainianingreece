import type { MetadataRoute } from "next";
import { getArticleSlugs, getEventSlugs, getFinancialReports, FINANCIAL_REPORTS_HREF } from "@/lib/cms";
import { getOrganizations } from "@/lib/organizations";
import { topics } from "@/lib/korysno";
import { absoluteUrl } from "@/lib/seo";
import { getBlogSlugs } from "@/lib/blog";

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
  const [articles, events, orgs, reports, posts] = await Promise.all([
    safe(getArticleSlugs(), []),
    safe(getEventSlugs(), []),
    safe(getOrganizations(), []),
    safe(getFinancialReports(), []),
    safe(getBlogSlugs(), []),
  ]);

  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({
    url: absoluteUrl(path),
    priority,
    changeFrequency,
  });

  return [
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
    ...topics.map((t) => page(`/korysno/${t.slug}`, 0.6, "monthly")),
    ...articles.map((a) => page(`/novyny/${a.slug}`, 0.6, "monthly")),
    ...events.map((e) => page(`/podiyi/${e.slug}`, 0.6, "monthly")),
    ...posts.map((p) => page(`/blog/${p.slug}`, 0.6, "monthly")),
  ];
}
