/**
 * Матеріали для завантаження (модель `resource` у DatoCMS) — блок на сторінці «Корисна інформація».
 * Файл у кожного матеріалу свій для кожної мови (uk / en / el).
 * Посилання ведуть на /api/download/<slug>/<мова> — там рахується завантаження і відбувається перехід на файл.
 */
import { cache } from "react";
import { datoRequest } from "./datocms";
import { locales, type Locale } from "./i18n/config";

export type ResourceFile = { locale: Locale; size: number; format: string };
export type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: { url: string; width: number; height: number } | null;
  files: ResourceFile[];
};
export type ResourceGroup = { id: string; title: string; items: Resource[] };

type Raw = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: { url: string; width: number; height: number } | null;
  category: { id: string; title: string; position: number } | null;
  _allFileLocales: { locale: Locale; value: { size: number; format: string } | null }[] | null;
};

export const getResourceGroups = cache(async (): Promise<ResourceGroup[]> => {
  try {
    const data = await datoRequest<{ items: Raw[] }>(`
      query Resources {
        items: allResources(locale: CUR, first: 100, orderBy: position_ASC) {
          id slug title description
          cover { url width height }
          category { id title position }
          _allFileLocales { locale value { size format } }
        }
      }`);
    const groups = new Map<string, ResourceGroup & { pos: number }>();
    for (const r of data.items) {
      const c = r.category ?? { id: "_", title: "", position: 999 };
      if (!groups.has(c.id)) groups.set(c.id, { id: c.id, title: c.title, pos: c.position, items: [] });
      const files = (r._allFileLocales ?? [])
        .filter((f) => f.value && locales.includes(f.locale))
        .map((f) => ({ locale: f.locale, size: f.value!.size, format: f.value!.format }))
        .sort((a, b) => locales.indexOf(a.locale) - locales.indexOf(b.locale));
      groups.get(c.id)!.items.push({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description ?? "",
        cover: r.cover,
        files,
      });
    }
    return [...groups.values()].sort((a, b) => a.pos - b.pos).map(({ pos, ...g }) => g);
  } catch (e) {
    console.error("resources:", e);
    return [];
  }
});

/** URL файлу потрібною мовою (для маршруту завантаження) */
export async function getResourceFile(slug: string, locale: Locale) {
  const data = await datoRequest<{ item: { file: { url: string; filename: string } | null } | null }>(
    `query File($slug: String) { item: resource(locale: ${locale}, filter: { slug: { eq: $slug } }) { file { url filename } } }`,
    { slug },
  );
  return data.item?.file ?? null;
}

export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
