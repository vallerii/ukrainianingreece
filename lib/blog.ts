/**
 * Блог — статті на загальні теми (правка клієнта 22.10.2026).
 *
 * Окрема модель DatoCMS «blog post» (api_key blog_post): title, slug, image, content (Markdown),
 * author, attachments (файли), videos (посилання YouTube). Створює її скрипт
 * scripts/datocms-update-2026-10b.mjs. Поки моделі немає — розділ показує «Статті готуються».
 *
 * Записи нормалізуються до того ж типу Article, що й новини, — щоб використовувати
 * ті самі компоненти (ArticleRow, Cover, RichText); посилання — /blog/<slug>.
 */
import { cache } from "react";
import { datoRequest } from "./datocms";
import { PAGE_SIZE, toHtml, type Article, type CmsImage, type Paged } from "./cms";
import { hueFrom } from "./format";

export const BLOG_HREF = "/blog";

const IMAGE = `url alt title width height`;
const FIELDS = `
  id slug title _firstPublishedAt content(markdown: true)
  author { name image { ${IMAGE} } }
  image { ${IMAGE} }
`;

type RawPost = {
  id: string;
  slug: string;
  title: string;
  _firstPublishedAt: string;
  content: string | null;
  author: { name: string; image: CmsImage | null } | null;
  image: CmsImage | null;
};

const toPost = (p: RawPost): Article => ({
  id: p.id,
  slug: p.slug,
  href: `${BLOG_HREF}/${p.slug}`,
  title: p.title,
  date: p._firstPublishedAt,
  type: null,
  author: p.author,
  image: p.image,
  html: toHtml(p.content),
  hue: hueFrom(p.id),
});

const empty = (page: number): Paged<Article> => ({ items: [], page, pages: 1, total: 0 });

/** Сторінка блогу (від нових до старих). */
export const getBlogPage = cache(async (page = 1, size = PAGE_SIZE): Promise<Paged<Article>> => {
  try {
    const data = await datoRequest<{ items: RawPost[]; meta: { count: number } }>(
      `query BlogPage($first: IntType, $skip: IntType) {
        items: allBlogPosts(first: $first, skip: $skip, orderBy: _firstPublishedAt_DESC) { ${FIELDS} }
        meta: _allBlogPostsMeta { count }
      }`,
      { first: size, skip: (page - 1) * size },
    );
    return {
      items: data.items.map(toPost),
      page,
      total: data.meta.count,
      pages: Math.max(1, Math.ceil(data.meta.count / size)),
    };
  } catch {
    // моделі ще немає (скрипт не запущено) або CMS недоступна
    return empty(page);
  }
});

export const getBlogPost = cache(async (slug: string) => {
  try {
    const data = await datoRequest<{ post: RawPost | null }>(
      `query BlogPost($slug: String) { post: blogPost(filter: { slug: { eq: $slug } }) { ${FIELDS} } }`,
      { slug },
    );
    return data.post ? toPost(data.post) : null;
  } catch {
    return null;
  }
});

/** Кілька свіжих записів (для «Читайте також»). */
export const getLatestBlogPosts = cache(async (count: number, excludeId?: string) => {
  try {
    const data = await datoRequest<{ items: RawPost[] }>(
      `query LatestBlog($first: IntType, $filter: BlogPostModelFilter) {
        items: allBlogPosts(first: $first, filter: $filter, orderBy: _firstPublishedAt_DESC) { ${FIELDS} }
      }`,
      { first: count, filter: excludeId ? { id: { neq: excludeId } } : {} },
    );
    return data.items.map(toPost);
  } catch {
    return [] as Article[];
  }
});

export const getBlogSlugs = cache(async () => {
  try {
    const data = await datoRequest<{ items: { slug: string }[] }>(
      `query BlogSlugs { items: allBlogPosts(first: 100) { slug } }`,
    );
    return data.items;
  } catch {
    return [] as { slug: string }[];
  }
});

/** Пошук: записи, де кожне слово запиту є в заголовку чи тексті (див. lib/search.ts). */
export const searchBlog = cache(async (terms: string[]) => {
  if (terms.length === 0) return [] as Article[];
  const m = (pattern: string) => ({ matches: { pattern, caseSensitive: false } });
  try {
    const data = await datoRequest<{ items: RawPost[] }>(
      `query SearchBlog($filter: BlogPostModelFilter) {
        items: allBlogPosts(first: 30, filter: $filter, orderBy: _firstPublishedAt_DESC) { ${FIELDS} }
      }`,
      { filter: { AND: terms.map((t) => ({ OR: [{ title: m(t) }, { content: m(t) }] })) } },
    );
    return data.items.map(toPost);
  } catch {
    return [] as Article[];
  }
});
