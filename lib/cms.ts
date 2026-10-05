import { cache } from "react";
import { datoRequest } from "./datocms";
import { dayKey, hueFrom, slugify, TIME_ZONE, yearOf } from "./format";

/* ────────────────────────────────────────────────────────────
 * Типи, з якими працюють сторінки (вже нормалізовані)
 * ──────────────────────────────────────────────────────────── */

export type Locale = "uk" | "en" | "el";

export type CmsImage = {
  url: string;
  alt: string | null;
  title: string | null;
  width: number;
  height: number;
};

export type Term = { id: string; title: string; slug: string };

export type Article = {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: Term | null;
  author: { name: string; image: CmsImage | null } | null;
  image: CmsImage | null;
  html: string;
  hue: number;
};

export type EventStatus = "upcoming" | "ongoing" | "past";

export type CmsEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  start: string;
  finish: string | null;
  tags: Term[];
  location: { latitude: number; longitude: number } | null;
  image: CmsImage | null;
  html: string;
  report: { html: string; gallery: CmsImage[] };
  hasReport: boolean;
  status: EventStatus;
  year: number;
  hue: number;
};

export type Paged<T> = { items: T[]; page: number; pages: number; total: number };

/** Скільки записів на сторінку у списках. */
export const PAGE_SIZE = 12;

/* ────────────────────────────────────────────────────────────
 * GraphQL
 * ──────────────────────────────────────────────────────────── */

const IMAGE = `url alt title width height`;

const ARTICLE_FIELDS = `
  id slug title _firstPublishedAt content(markdown: true)
  tags { id title }
  author { name image { ${IMAGE} } }
  image { ${IMAGE} }
`;

const EVENT_FIELDS = `
  id slug title description dateStart dateFinish content(markdown: true) reportContent(markdown: true)
  tag { id title }
  location { latitude longitude }
  image { ${IMAGE} }
  reportGallery { ${IMAGE} }
`;

/** Максимум, який DatoCMS віддає за один запит; більше — догружаємо порціями. */
const CHUNK = 100;

type RawImage = CmsImage | null;
type RawArticle = {
  id: string;
  slug: string;
  title: string;
  _firstPublishedAt: string;
  content: string | null;
  tags: { id: string; title: string } | null;
  author: { name: string; image: RawImage } | null;
  image: RawImage;
};
type RawEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  dateStart: string;
  dateFinish: string | null;
  content: string | null;
  reportContent: string | null;
  tag: { id: string; title: string }[];
  location: { latitude: number; longitude: number } | null;
  image: RawImage;
  reportGallery: CmsImage[];
};

const term = (t: { id: string; title: string }): Term => ({
  ...t,
  slug: slugify(t.title) || t.id,
});

/**
 * Тексти в CMS пишуться в Markdown (картинки — `![](url)`); DatoCMS віддає їх готовим HTML
 * завдяки `content(markdown: true)`. Редактори ставлять один перенос рядка між абзацами,
 * а Markdown склеює такі рядки в один абзац — тож розбиваємо їх на окремі <p>.
 */
export function toHtml(html: string | null | undefined) {
  if (!html) return "";
  return html.replace(/([^>\n])\n(?=[^\n])/g, "$1</p>\n<p>").replace(/<p>\s*<\/p>/g, "");
}

const hasText = (html: string | null | undefined) =>
  !!html && html.replace(/<[^>]+>|&nbsp;|\s/g, "").length > 0;

function toArticle(a: RawArticle): Article {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    date: a._firstPublishedAt,
    type: a.tags ? term(a.tags) : null,
    author: a.author,
    image: a.image,
    html: toHtml(a.content),
    hue: hueFrom(a.id),
  };
}

/**
 * Статус події з дат (за календарем Афін):
 *  - є date_finish → «триває» між стартом і фінішем;
 *  - немає date_finish → «триває» до кінця дня старту.
 */
export function eventStatus(start: string, finish: string | null, now = new Date()): EventStatus {
  const t = now.getTime();
  if (t < new Date(start).getTime()) return "upcoming";
  if (finish) return t <= new Date(finish).getTime() ? "ongoing" : "past";
  return dayKey(now) === dayKey(start) ? "ongoing" : "past";
}

function toEvent(e: RawEvent, now = new Date()): CmsEvent {
  const gallery = e.reportGallery ?? [];
  const reportHtml = toHtml(e.reportContent);
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description ?? "",
    start: e.dateStart,
    finish: e.dateFinish,
    tags: (e.tag ?? []).map(term),
    location: e.location,
    image: e.image,
    html: toHtml(e.content),
    report: { html: reportHtml, gallery },
    hasReport: hasText(reportHtml) || gallery.length > 0,
    status: eventStatus(e.dateStart, e.dateFinish, now),
    year: yearOf(e.dateStart),
    hue: hueFrom(e.id),
  };
}

/**
 * Початок сьогоднішнього дня за Афінами, напр. «2026-10-04T00:00:00+03:00».
 * Межа «прийдешні / минулі» змінюється раз на добу — тож запити до CMS добре кешуються.
 */
export function todayStart(now = new Date()) {
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")
      ?.value.replace("GMT", "") || "+00:00";
  return `${dayKey(now)}T00:00:00${offset}`;
}

const yearStart = (y: number) => `${y}-01-01T00:00:00+02:00`; // січень у Афінах — завжди +02

type Filter = Record<string, unknown>;

/** Номер сторінки з адреси: ?page=2 → 2. Некоректне → 1. */
export function parsePage(value: string | undefined) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** Догружає всі записи порціями по CHUNK (для slug-ів, архіву за рік тощо). */
async function fetchAll<T>(
  collection: string,
  fields: string,
  opts: { filter?: Filter; orderBy?: string; filterType: string; locale?: Locale },
): Promise<T[]> {
  const out: T[] = [];
  for (let skip = 0; ; skip += CHUNK) {
    const data = await datoRequest<{ items: T[] }>(
      `query All($skip: IntType, $filter: ${opts.filterType}, $locale: SiteLocale) {
        items: ${collection}(locale: $locale, first: ${CHUNK}, skip: $skip, filter: $filter${
          opts.orderBy ? `, orderBy: ${opts.orderBy}` : ""
        }) { ${fields} }
      }`,
      { skip, filter: opts.filter ?? {}, locale: opts.locale ?? "uk" },
    );
    out.push(...data.items);
    if (data.items.length < CHUNK) return out;
  }
}

/* ────────────────────────────────────────────────────────────
 * Статті
 * ──────────────────────────────────────────────────────────── */

/** Сторінка стрічки новин (за замовчуванням по 12), опційно — лише одного типу. */
export const getArticlesPage = cache(
  async (page = 1, typeId: string | null = null, size = PAGE_SIZE, locale: Locale = "uk") => {
    const filter: Filter = typeId ? { tags: { eq: typeId } } : {};
    const data = await datoRequest<{ items: RawArticle[]; meta: { count: number } }>(
      `query ArticlesPage($first: IntType, $skip: IntType, $filter: ArticleModelFilter, $locale: SiteLocale) {
        items: allArticles(locale: $locale, first: $first, skip: $skip, filter: $filter, orderBy: _firstPublishedAt_DESC) { ${ARTICLE_FIELDS} }
        meta: _allArticlesMeta(locale: $locale, filter: $filter) { count }
      }`,
      { first: size, skip: (page - 1) * size, filter, locale },
    );
    return {
      items: data.items.map(toArticle),
      page,
      total: data.meta.count,
      pages: Math.max(1, Math.ceil(data.meta.count / size)),
    } satisfies Paged<Article>;
  },
);

/** Кілька свіжих статей (для головної та «Читайте також»). */
export const getLatestArticles = cache(
  async (count: number, opts: { typeId?: string | null; excludeId?: string } = {}) => {
    const filter: Filter = {
      ...(opts.typeId ? { tags: { eq: opts.typeId } } : {}),
      ...(opts.excludeId ? { id: { neq: opts.excludeId } } : {}),
    };
    const data = await datoRequest<{ items: RawArticle[] }>(
      `query Latest($first: IntType, $filter: ArticleModelFilter) {
        items: allArticles(locale: uk, first: $first, filter: $filter, orderBy: _firstPublishedAt_DESC) { ${ARTICLE_FIELDS} }
      }`,
      { first: count, filter },
    );
    return data.items.map(toArticle);
  },
);

export const getArticle = cache(async (slug: string, locale: Locale = "uk") => {
  const data = await datoRequest<{ article: RawArticle | null }>(
    `query Article($slug: String, $locale: SiteLocale) {
      article(locale: $locale, filter: { slug: { eq: $slug } }) { ${ARTICLE_FIELDS} }
    }`,
    { slug, locale },
  );
  return data.article ? toArticle(data.article) : null;
});

export const getArticleSlugs = cache(async () =>
  fetchAll<{ slug: string }>("allArticles", "slug", { filterType: "ArticleModelFilter" }),
);

/** Типи матеріалів разом із кількістю статей кожного типу. */
export const getArticleTypes = cache(async (locale: Locale = "uk") => {
  const data = await datoRequest<{ allArticleTypes: { id: string; title: string }[] }>(
    `query ArticleTypes($locale: SiteLocale) {
      allArticleTypes(locale: $locale, first: ${CHUNK}) { id title }
    }`,
    { locale },
  );
  const types = data.allArticleTypes.map(term);
  const counts = await datoRequest<Record<string, { count: number }>>(
    `query TypeCounts {
      all: _allArticlesMeta { count }
      ${types.map((t, i) => `t${i}: _allArticlesMeta(filter: { tags: { eq: "${t.id}" } }) { count }`).join("\n")}
    }`,
  );
  return {
    total: counts.all.count,
    types: types.map((t, i) => ({ ...t, count: counts[`t${i}`].count })),
  };
});

/* ────────────────────────────────────────────────────────────
 * Події
 * ──────────────────────────────────────────────────────────── */

/** Прийдешні та ті, що тривають (від найближчих), сторінками. */
export const getUpcomingEvents = cache(
  async (page = 1, tagId: string | null = null, size = PAGE_SIZE) => {
    const t = todayStart();
    const filter: Filter = {
      // з запасом: усе, що починається або закінчується від початку сьогоднішнього дня;
      // те, що вже завершилося сьогодні, відсіюємо нижче за статусом
      OR: [{ dateStart: { gte: t } }, { dateFinish: { gte: t } }],
      ...(tagId ? { tag: { anyIn: [tagId] } } : {}),
    };
    const data = await datoRequest<{ items: RawEvent[]; meta: { count: number } }>(
      `query Upcoming($first: IntType, $skip: IntType, $filter: EventModelFilter) {
        items: allEvents(locale: uk, first: $first, skip: $skip, filter: $filter, orderBy: dateStart_ASC) { ${EVENT_FIELDS} }
        meta: _allEventsMeta(locale: uk, filter: $filter) { count }
      }`,
      { first: size, skip: (page - 1) * size, filter },
    );
    const now = new Date();
    return {
      items: data.items.map((e) => toEvent(e, now)).filter((e) => e.status !== "past"),
      page,
      total: data.meta.count,
      pages: Math.max(1, Math.ceil(data.meta.count / size)),
    } satisfies Paged<CmsEvent>;
  },
);

/** Останні минулі події (від найсвіжіших). */
export const getRecentPastEvents = cache(async (count: number, tagId: string | null = null) => {
  const filter: Filter = {
    dateStart: { lt: todayStart() },
    ...(tagId ? { tag: { anyIn: [tagId] } } : {}),
  };
  const data = await datoRequest<{ items: RawEvent[] }>(
    `query RecentPast($first: IntType, $filter: EventModelFilter) {
      items: allEvents(locale: uk, first: $first, filter: $filter, orderBy: dateStart_DESC) { ${EVENT_FIELDS} }
    }`,
    { first: count, filter },
  );
  return data.items.map((e) => toEvent(e));
});

/** Роки, в які були події, з кількістю (від нових до старих) — для архіву звітів. */
export const getArchiveYears = cache(async () => {
  const items = await fetchAll<{ dateStart: string }>("allEvents", "dateStart", {
    filterType: "EventModelFilter",
    filter: { dateStart: { lt: todayStart() } },
    orderBy: "dateStart_DESC",
  });
  const map = new Map<number, number>();
  for (const e of items) map.set(yearOf(e.dateStart), (map.get(yearOf(e.dateStart)) ?? 0) + 1);
  return [...map].map(([year, count]) => ({ year, count }));
});

/** Усі минулі події одного року (від нових до старих). */
export const getArchiveYear = cache(async (year: number) => {
  const items = await fetchAll<RawEvent>("allEvents", EVENT_FIELDS, {
    filterType: "EventModelFilter",
    filter: {
      AND: [
        { dateStart: { gte: yearStart(year) } },
        { dateStart: { lt: yearStart(year + 1) } },
        { dateStart: { lt: todayStart() } },
      ],
    },
    orderBy: "dateStart_DESC",
  });
  return items.map((e) => toEvent(e));
});

export const getEvent = cache(async (slug: string, locale: Locale = "uk") => {
  const data = await datoRequest<{ event: RawEvent | null }>(
    `query Event($slug: String, $locale: SiteLocale) {
      event(locale: $locale, filter: { slug: { eq: $slug } }) { ${EVENT_FIELDS} }
    }`,
    { slug, locale },
  );
  return data.event ? toEvent(data.event) : null;
});

export const getEventSlugs = cache(async () =>
  fetchAll<{ slug: string }>("allEvents", "slug", { filterType: "EventModelFilter" }),
);

export const getTags = cache(async (locale: Locale = "uk"): Promise<Term[]> => {
  const data = await datoRequest<{ allTags: { id: string; title: string }[] }>(
    `query Tags($locale: SiteLocale) {
      allTags(locale: $locale, first: ${CHUNK}) { id title }
    }`,
    { locale },
  );
  return data.allTags.map(term);
});

export const statusLabel: Record<EventStatus, string> = {
  upcoming: "Скоро",
  ongoing: "Триває зараз",
  past: "Відбулася",
};

/* ────────────────────────────────────────────────────────────
 * Пошук (див. lib/search.ts)
 * ──────────────────────────────────────────────────────────── */

/**
 * Статті й події, в яких КОЖНЕ слово запиту трапляється хоча б в одному з полів
 * (заголовок, опис, текст, звіт). Без урахування регістру; слова — вже «обрізані» до основи.
 */
export const searchCms = cache(async (terms: string[]) => {
  if (terms.length === 0) return { articles: [] as Article[], events: [] as CmsEvent[] };
  const m = (pattern: string) => ({ matches: { pattern, caseSensitive: false } });
  const af = { AND: terms.map((t) => ({ OR: [{ title: m(t) }, { content: m(t) }] })) };
  const ef = {
    AND: terms.map((t) => ({
      OR: [{ title: m(t) }, { description: m(t) }, { content: m(t) }, { reportContent: m(t) }],
    })),
  };
  const data = await datoRequest<{ a: RawArticle[]; e: RawEvent[] }>(
    `query Search($af: ArticleModelFilter, $ef: EventModelFilter) {
      a: allArticles(locale: uk, first: 30, filter: $af, orderBy: _firstPublishedAt_DESC) { ${ARTICLE_FIELDS} }
      e: allEvents(locale: uk, first: 30, filter: $ef, orderBy: dateStart_DESC) { ${EVENT_FIELDS} }
    }`,
    { af, ef },
  );
  const now = new Date();
  return { articles: data.a.map(toArticle), events: data.e.map((e) => toEvent(e, now)) };
});

/** Статті, де в заголовку чи тексті трапляється ХОЧА Б ОДНЕ з ключових слів (для тем «Корисної інформації»). */
export const getArticlesByKeywords = cache(async (keywords: string[], first = 50) => {
  if (keywords.length === 0) return [] as Article[];
  const m = (pattern: string) => ({ matches: { pattern, caseSensitive: false } });
  const filter = { OR: keywords.flatMap((k) => [{ title: m(k) }, { content: m(k) }]) };
  const data = await datoRequest<{ items: RawArticle[] }>(
    `query ByKeywords($first: IntType, $filter: ArticleModelFilter) {
      items: allArticles(locale: uk, first: $first, filter: $filter, orderBy: _firstPublishedAt_DESC) { ${ARTICLE_FIELDS} }
    }`,
    { first, filter },
  );
  return data.items.map(toArticle);
});

/* ────────────────────────────────────────────────────────────
 * Фінансові звіти (модель financial_report)
 * ──────────────────────────────────────────────────────────── */

export type FinancialReport = {
  id: string;
  title: string;
  year: number;
  html: string;
  income: number | null;
  expenses: number | null;
  file: { url: string; filename: string; size: number } | null;
};

/**
 * Опубліковані фінансові звіти, від нових до старих.
 * Якщо моделі ще немає в DatoCMS або сталася помилка — повертаємо порожній список,
 * і посилання «Звіти про використання коштів» просто не показується.
 */
export const getFinancialReports = cache(async (): Promise<FinancialReport[]> => {
  try {
    const data = await datoRequest<{
      items: (Omit<FinancialReport, "html"> & { summary: string | null })[];
    }>(
      `query FinancialReports {
        items: allFinancialReports(first: 100, orderBy: year_DESC) {
          id title year summary(markdown: true) income expenses
          file { url filename size }
        }
      }`,
    );
    return data.items.map(({ summary, ...r }) => ({ ...r, html: toHtml(summary) }));
  } catch {
    return [];
  }
});

export const FINANCIAL_REPORTS_HREF = "/finansovi-zvity";
